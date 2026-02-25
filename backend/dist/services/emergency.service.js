"use strict";
/**
 * Emergency Escalation Service
 *
 * Handles emergency case detection, PHC notification, and referral generation
 * for high-risk triage cases.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyService = exports.EmergencyService = void 0;
const dynamodb_service_1 = __importDefault(require("./dynamodb.service"));
const aws_config_1 = __importDefault(require("../config/aws.config"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Emergency Service Class
 */
class EmergencyService {
    /**
     * Check if triage result requires emergency escalation
     *
     * @param triageResult - Triage assessment result
     * @returns True if emergency escalation needed
     */
    shouldEscalate(triageResult) {
        const { response } = triageResult;
        // Emergency level always escalates
        if (response.urgencyLevel === 'emergency') {
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
            // Find nearest PHC
            const nearestPhc = await this.findNearestPHC(triageResult.request.location?.district || 'unknown', triageResult.request.location?.state || 'unknown', triageResult.request.location?.latitude, triageResult.request.location?.longitude);
            // Generate referral note
            const referralNote = this.generateReferralNote(triageResult);
            // Create emergency escalation record
            const escalation = {
                triageId: triageResult.triageId,
                urgencyLevel: 'emergency',
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
                timestamp: new Date().toISOString(),
                notificationSent: false
            };
            // Store emergency case in DynamoDB
            const emergencyId = await dynamodb_service_1.default.storeEmergencyCase(escalation);
            // Send notification to PHC (if enabled)
            if (aws_config_1.default.emergency.phcNotificationEnabled) {
                await this.notifyPHC(escalation, emergencyId);
            }
            logger_1.default.logEmergencyEscalation(triageResult.triageId, {
                emergencyId,
                nearestPhc: nearestPhc.name,
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
     * Find nearest Primary Health Center
     *
     * @param district - Patient district
     * @param state - Patient state
     * @param latitude - Patient latitude (optional)
     * @param longitude - Patient longitude (optional)
     * @returns Nearest PHC information
     */
    async findNearestPHC(district, state, latitude, longitude) {
        // In production, query PHC database or use geospatial search
        // For now, return mock data
        logger_1.default.debug('Finding nearest PHC', { district, state, latitude, longitude });
        // Mock PHC data
        const mockPHCs = [
            {
                name: 'District Primary Health Center',
                district,
                state,
                contact: aws_config_1.default.emergency.emergencyContactNumber,
                latitude: latitude || 0,
                longitude: longitude || 0
            }
        ];
        // Calculate distance if coordinates provided
        const distance = latitude && longitude ? this.calculateDistance(latitude, longitude, mockPHCs[0].latitude, mockPHCs[0].longitude) : 5.0;
        return {
            name: mockPHCs[0].name,
            distance,
            contact: mockPHCs[0].contact
        };
    }
    /**
     * Calculate distance between two coordinates (Haversine formula)
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
     * Send notification to PHC dashboard
     * In production, this would use SNS, SQS, or WebSocket
     */
    async notifyPHC(escalation, emergencyId) {
        try {
            logger_1.default.info('Sending PHC notification', {
                emergencyId,
                phc: escalation.nearestPhc.name
            });
            // In production:
            // - Send SNS notification
            // - Push to SQS queue for PHC dashboard
            // - Send SMS to on-call doctor
            // - Update WebSocket connections
            // For now, just log
            logger_1.default.info('PHC notification sent', {
                emergencyId,
                phc: escalation.nearestPhc.name,
                contact: escalation.nearestPhc.contact
            });
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
     * Check if symptoms contain emergency keywords
     */
    containsEmergencyKeywords(symptoms) {
        const emergencyKeywords = [
            'chest pain',
            'difficulty breathing',
            'unconscious',
            'severe bleeding',
            'stroke',
            'heart attack',
            'seizure',
            'poisoning',
            'severe burn',
            'head injury',
            'suicide',
            'overdose'
        ];
        const lowerSymptoms = symptoms.toLowerCase();
        return emergencyKeywords.some(keyword => lowerSymptoms.includes(keyword));
    }
}
exports.EmergencyService = EmergencyService;
/**
 * Export singleton instance
 */
exports.emergencyService = new EmergencyService();
exports.default = exports.emergencyService;
//# sourceMappingURL=emergency.service.js.map