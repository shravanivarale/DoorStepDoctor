"use strict";
/**
 * Emergency Escalation Service
 *
 * Handles emergency case detection, PHC notification, and referral generation
 * for high-risk triage cases.
 *
 * ── P0-3: Composite Risk Scoring ──
 * riskScore is a COMPOSITE of two sources:
 *   primaryScore  — extracted from Claude's JSON output (0.0–1.0)
 *   keywordBoost  — +0.3 if ANY emergency keyword appears in symptom text
 *   finalScore    = clamp(primaryScore + keywordBoost, 0.0, 1.0)
 * If keywordBoost was applied, urgencyLevel is overridden to "critical"
 * regardless of Claude's output. The keyword check is the safety net.
 *
 * ── P0-5: Notification with Delivery Confirmation ──
 * On emergency creation: notificationStatus = "pending_ack", notifiedAt = now
 * Real SNS publish for PHC notification.
 *
 * ── P0-6: Nearest PHC from DynamoDB ──
 * Queries asha-phc-directory by district GSI, calculates Haversine distance,
 * returns closest PHC. Falls back to { name: "District PHC Helpline", ... }.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyService = exports.EmergencyService = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const client_sns_1 = require("@aws-sdk/client-sns");
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
const dynamodb_service_1 = __importDefault(require("./dynamodb.service"));
const aws_config_1 = __importDefault(require("../config/aws.config"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * ── P0-3: Emergency keywords that trigger keywordBoost (+0.3) ──
 * If ANY of these appear in the symptom string (case-insensitive),
 * the urgencyLevel is overridden to "critical" and riskScore is boosted.
 * This list is the clinical safety net — not a hint.
 */
const EMERGENCY_KEYWORDS = [
    'chest pain',
    'difficulty breathing',
    'unconscious',
    'not breathing',
    'seizure',
    'heavy bleeding',
    'not responding',
    'preterm labour',
    'cord prolapse',
    'snake bite',
    'poisoning',
    'choking'
];
/**
 * Emergency Service Class
 */
class EmergencyService {
    constructor() {
        this.dynamoClient = new client_dynamodb_1.DynamoDBClient({ region: aws_config_1.default.region });
        this.snsClient = new client_sns_1.SNSClient({ region: aws_config_1.default.region });
        this.cloudwatchClient = new client_cloudwatch_1.CloudWatchClient({ region: aws_config_1.default.region });
    }
    /**
     * ── P0-3: Composite Risk Score Calculation ──
     *
     * SCORING FORMULA:
     *   primaryScore  = riskScore from Claude's JSON output (0.0–1.0)
     *   keywordBoost  = +0.3 if ANY emergency keyword is found in symptoms
     *   finalScore    = Math.min(1.0, Math.max(0.0, primaryScore + keywordBoost))
     *
     * If keywordBoost was applied:
     *   - urgencyLevel is overridden to "critical"
     *   - This is a SAFETY OVERRIDE, not a suggestion
     *
     * Both primaryScore and finalScore are logged to CloudWatch for drift monitoring.
     *
     * @param response - The triage response from Claude (will be mutated)
     * @param symptoms - Raw symptom string from the ASHA worker
     * @returns The mutated response with composite score applied
     */
    applyCompositeRiskScore(response, symptoms) {
        const primaryScore = response.riskScore;
        const keywordBoost = this.checkEmergencyKeywords(symptoms) ? 0.3 : 0;
        const finalScore = Math.min(1.0, Math.max(0.0, primaryScore + keywordBoost));
        response.riskScore = finalScore;
        // If keyword boost was applied, override urgencyLevel to "critical"
        // regardless of Claude's output. The keyword check IS the safety net.
        if (keywordBoost > 0) {
            response.urgencyLevel = 'critical';
            response.referToPhc = true;
            logger_1.default.warn('P0-3: Emergency keyword detected — overriding to critical', {
                primaryScore,
                keywordBoost,
                finalScore,
                symptoms
            });
        }
        // Emit both scores to CloudWatch for drift monitoring
        this.emitRiskScoreMetrics(primaryScore, finalScore).catch(() => {
            // Non-blocking — metric failure must not affect triage
        });
        return response;
    }
    /**
     * Check if symptoms contain any emergency keywords (P0-3)
     */
    checkEmergencyKeywords(symptoms) {
        const lowerSymptoms = symptoms.toLowerCase();
        return EMERGENCY_KEYWORDS.some(keyword => lowerSymptoms.includes(keyword));
    }
    /**
     * Check if triage result requires emergency escalation
     *
     * @param triageResult - Triage assessment result
     * @returns True if emergency escalation needed
     */
    shouldEscalate(triageResult) {
        const { response } = triageResult;
        // Emergency or critical level always escalates
        if (response.urgencyLevel === 'emergency' || response.urgencyLevel === 'critical') {
            return true;
        }
        // High risk score triggers escalation
        if (response.riskScore >= aws_config_1.default.emergency.autoEscalationThreshold) {
            return true;
        }
        // Explicit PHC referral recommendation
        if (response.referToPhc && response.urgencyLevel === 'high') {
            return true;
        }
        return false;
    }
    /**
     * Process emergency escalation
     *
     * ── P0-5: Sets notificationStatus = "pending_ack" and notifiedAt timestamp ──
     * ── P0-6: Queries real PHC directory instead of mock data ──
     *
     * @param triageResult - Triage assessment result
     * @returns Emergency escalation record
     */
    async processEmergency(triageResult) {
        try {
            logger_1.default.info('Processing emergency escalation', {
                triageId: triageResult.triageId,
                urgencyLevel: triageResult.response.urgencyLevel,
                riskScore: triageResult.response.riskScore
            });
            // ── P0-6: Find nearest PHC from DynamoDB directory ──
            const nearestPhc = await this.findNearestPHC(triageResult.request.location?.district || 'unknown', triageResult.request.location?.state || 'unknown', triageResult.request.location?.latitude, triageResult.request.location?.longitude);
            // Generate referral note
            const referralNote = this.generateReferralNote(triageResult);
            const now = new Date().toISOString();
            // ── P0-5: Create emergency record with notification tracking ──
            const escalation = {
                triageId: triageResult.triageId,
                urgencyLevel: triageResult.response.urgencyLevel === 'critical' ? 'critical' : 'emergency',
                patientInfo: {
                    age: triageResult.request.patientAge,
                    gender: triageResult.request.patientGender,
                    symptoms: triageResult.request.symptoms
                },
                location: {
                    district: triageResult.request.location?.district || 'unknown',
                    state: triageResult.request.location?.state || 'unknown',
                    coordinates: triageResult.request.location?.latitude && triageResult.request.location?.longitude
                        ? {
                            latitude: triageResult.request.location.latitude,
                            longitude: triageResult.request.location.longitude
                        }
                        : undefined
                },
                nearestPhc,
                referralNote,
                timestamp: now,
                notificationSent: false,
                notificationStatus: 'pending_ack',
                notifiedAt: now
            };
            // Store emergency case in DynamoDB
            const emergencyId = await dynamodb_service_1.default.storeEmergencyCase(escalation);
            // ── P0-5: Send real SNS notification to PHC ──
            if (aws_config_1.default.emergency.phcNotificationEnabled) {
                await this.notifyPHC(escalation, emergencyId);
            }
            logger_1.default.logEmergencyEscalation(triageResult.triageId, {
                emergencyId,
                nearestPhc: nearestPhc.name,
                notificationStatus: 'pending_ack',
                notificationSent: aws_config_1.default.emergency.phcNotificationEnabled
            });
            return escalation;
        }
        catch (error) {
            logger_1.default.error('Emergency escalation failed', error, {
                triageId: triageResult.triageId
            });
            throw error;
        }
    }
    /**
     * ── P0-6: Find nearest PHC from DynamoDB asha-phc-directory table ──
     *
     * Queries the asha-phc-directory table by district using the district-state-index GSI.
     * Calculates straight-line distance using Haversine formula for each result.
     * Returns the record with the shortest distance.
     *
     * If no PHC found for district, returns safe fallback:
     *   { name: "District PHC Helpline", phoneNumber: "104", distance: null }
     *
     * @param district - Patient district
     * @param state - Patient state
     * @param latitude - Patient latitude (optional)
     * @param longitude - Patient longitude (optional)
     * @returns Nearest PHC information
     */
    async findNearestPHC(district, state, latitude, longitude) {
        try {
            logger_1.default.debug('Finding nearest PHC from directory', { district, state, latitude, longitude });
            const command = new client_dynamodb_1.QueryCommand({
                TableName: aws_config_1.default.dynamodb.phcDirectoryTable,
                IndexName: 'district-state-index',
                KeyConditionExpression: 'district = :district AND #state = :state',
                ExpressionAttributeNames: {
                    '#state': 'state'
                },
                ExpressionAttributeValues: (0, util_dynamodb_1.marshall)({
                    ':district': district,
                    ':state': state
                })
            });
            const response = await this.dynamoClient.send(command);
            if (!response.Items || response.Items.length === 0) {
                logger_1.default.warn('No PHC found in directory for district — returning fallback', {
                    district,
                    state
                });
                return {
                    name: 'District PHC Helpline',
                    distance: null,
                    contact: '104'
                };
            }
            const phcRecords = response.Items.map(item => (0, util_dynamodb_1.unmarshall)(item));
            // If we have patient coordinates, calculate Haversine distance to each PHC
            if (latitude && longitude) {
                let nearest = phcRecords[0];
                let shortestDistance = this.calculateDistance(latitude, longitude, nearest.latitude, nearest.longitude);
                for (let i = 1; i < phcRecords.length; i++) {
                    const dist = this.calculateDistance(latitude, longitude, phcRecords[i].latitude, phcRecords[i].longitude);
                    if (dist < shortestDistance) {
                        shortestDistance = dist;
                        nearest = phcRecords[i];
                    }
                }
                return {
                    name: nearest.name,
                    distance: Math.round(shortestDistance * 10) / 10, // Round to 1 decimal
                    contact: nearest.phoneNumber
                };
            }
            // No coordinates — return first PHC in district with null distance
            return {
                name: phcRecords[0].name,
                distance: null,
                contact: phcRecords[0].phoneNumber
            };
        }
        catch (error) {
            logger_1.default.error('PHC directory lookup failed — returning fallback', error, {
                district,
                state
            });
            // Fallback: never let PHC lookup failure block emergency processing
            return {
                name: 'District PHC Helpline',
                distance: null,
                contact: '104'
            };
        }
    }
    /**
     * Calculate distance between two coordinates (Haversine formula)
     * Returns distance in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * Generate referral note for PHC doctor
     */
    generateReferralNote(triageResult) {
        const { request, response } = triageResult;
        const note = `
EMERGENCY REFERRAL NOTE
Generated: ${new Date().toISOString()}

PATIENT INFORMATION:
- Age: ${request.patientAge || 'Not provided'}
- Gender: ${request.patientGender || 'Not provided'}
- Location: ${request.location?.district || 'Unknown'}, ${request.location?.state || 'Unknown'}

PRESENTING SYMPTOMS:
${request.symptoms}

TRIAGE ASSESSMENT:
- Urgency Level: ${response.urgencyLevel.toUpperCase()}
- Risk Score: ${(response.riskScore * 100).toFixed(0)}%
- Confidence: ${(response.confidenceScore * 100).toFixed(0)}%

RECOMMENDED ACTION:
${response.recommendedAction}

RED FLAGS:
${response.redFlags?.join('\n') || 'None identified'}

CLINICAL GUIDELINE REFERENCE:
${response.citedGuideline}

REASONING:
${response.reasoning || 'See assessment above'}

---
This is an AI-generated triage assessment. Please conduct a thorough clinical evaluation.
ASHA Worker ID: ${request.userId}
Triage ID: ${triageResult.triageId}
`;
        return note.trim();
    }
    /**
     * ── P0-5: Send SNS notification to PHC ──
     * Publishes emergency alert via SNS topic for PHC dashboard consumption.
     */
    async notifyPHC(escalation, emergencyId) {
        try {
            logger_1.default.info('Sending PHC notification via SNS', {
                emergencyId,
                phc: escalation.nearestPhc.name
            });
            if (aws_config_1.default.emergency.escalationSnsTopicArn) {
                await this.snsClient.send(new client_sns_1.PublishCommand({
                    TopicArn: aws_config_1.default.emergency.escalationSnsTopicArn,
                    Subject: `EMERGENCY: ${escalation.urgencyLevel.toUpperCase()} — ${escalation.location.district}`,
                    Message: JSON.stringify({
                        emergencyId,
                        triageId: escalation.triageId,
                        urgencyLevel: escalation.urgencyLevel,
                        district: escalation.location.district,
                        state: escalation.location.state,
                        symptoms: escalation.patientInfo.symptoms,
                        nearestPhc: escalation.nearestPhc.name,
                        timestamp: escalation.timestamp
                    }),
                    MessageAttributes: {
                        urgencyLevel: {
                            DataType: 'String',
                            StringValue: escalation.urgencyLevel
                        },
                        district: {
                            DataType: 'String',
                            StringValue: escalation.location.district
                        }
                    }
                }));
                logger_1.default.info('PHC notification sent via SNS', {
                    emergencyId,
                    phc: escalation.nearestPhc.name,
                    topic: aws_config_1.default.emergency.escalationSnsTopicArn
                });
            }
            else {
                logger_1.default.warn('SNS topic ARN not configured — PHC notification skipped', {
                    emergencyId
                });
            }
        }
        catch (error) {
            logger_1.default.error('PHC notification failed', error, {
                emergencyId
            });
            // Don't throw - notification failure shouldn't block escalation
        }
    }
    /**
     * Get emergency contact information
     */
    getEmergencyContact() {
        return aws_config_1.default.emergency.emergencyContactNumber;
    }
    /**
     * Check if symptoms contain emergency keywords (public API)
     * Used by triage handler for quick pre-screening.
     */
    containsEmergencyKeywords(symptoms) {
        return this.checkEmergencyKeywords(symptoms);
    }
    /**
     * Emit primaryScore and finalScore to CloudWatch for drift monitoring (P0-3)
     */
    async emitRiskScoreMetrics(primaryScore, finalScore) {
        try {
            await this.cloudwatchClient.send(new client_cloudwatch_1.PutMetricDataCommand({
                Namespace: aws_config_1.default.cloudwatch.metricsNamespace,
                MetricData: [
                    {
                        MetricName: 'risk_score_primary',
                        Value: primaryScore,
                        Unit: 'None',
                        Timestamp: new Date()
                    },
                    {
                        MetricName: 'risk_score_final',
                        Value: finalScore,
                        Unit: 'None',
                        Timestamp: new Date()
                    }
                ]
            }));
        }
        catch (error) {
            logger_1.default.warn('Failed to emit risk score metrics', {
                error: error.message
            });
        }
    }
}
exports.EmergencyService = EmergencyService;
/**
 * Export singleton instance
 */
exports.emergencyService = new EmergencyService();
exports.default = exports.emergencyService;
//# sourceMappingURL=emergency.service.js.map