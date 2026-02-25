"use strict";
/**
 * DynamoDB Service
 *
 * Handles all database operations for the triage system including:
 * - Triage record storage
 * - User session management
 * - Emergency case logging
 * - Analytics data aggregation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamoDBService = exports.DynamoDBService = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const uuid_1 = require("uuid");
const aws_config_1 = __importDefault(require("../config/aws.config"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
/**
 * DynamoDB Service Class
 */
class DynamoDBService {
    constructor() {
        this.client = new client_dynamodb_1.DynamoDBClient({ region: aws_config_1.default.region });
    }
    /**
     * Store triage result in DynamoDB
     *
     * @param triageResult - Complete triage assessment result
     * @returns Stored triage ID
     */
    async storeTriageResult(triageResult) {
        try {
            const item = {
                triageId: triageResult.triageId,
                userId: triageResult.request.userId,
                timestamp: triageResult.request.timestamp,
                symptoms: triageResult.request.symptoms,
                language: triageResult.request.language,
                urgencyLevel: triageResult.response.urgencyLevel,
                riskScore: triageResult.response.riskScore,
                recommendedAction: triageResult.response.recommendedAction,
                referToPhc: triageResult.response.referToPhc,
                confidenceScore: triageResult.response.confidenceScore,
                citedGuideline: triageResult.response.citedGuideline,
                processingTimeMs: triageResult.metadata.processingTimeMs,
                bedrockTokensUsed: triageResult.metadata.bedrockTokensUsed,
                guardrailsTriggered: triageResult.metadata.guardrailsTriggered,
                location: triageResult.request.location,
                patientAge: triageResult.request.patientAge,
                patientGender: triageResult.request.patientGender,
                // TTL: 90 days for data retention
                ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)
            };
            const command = new client_dynamodb_1.PutItemCommand({
                TableName: aws_config_1.default.dynamodb.triageTable,
                Item: (0, util_dynamodb_1.marshall)(item, { removeUndefinedValues: true })
            });
            await this.client.send(command);
            logger_1.default.info('Triage result stored', {
                triageId: triageResult.triageId,
                urgencyLevel: triageResult.response.urgencyLevel
            });
            return triageResult.triageId;
        }
        catch (error) {
            logger_1.default.error('Failed to store triage result', error, {
                triageId: triageResult.triageId
            });
            throw new errors_1.DatabaseError('store_triage', {
                triageId: triageResult.triageId,
                error: error.message
            });
        }
    }
    /**
     * Retrieve triage result by ID
     *
     * @param triageId - Unique triage identifier
     * @returns Triage result or null if not found
     */
    async getTriageResult(triageId) {
        try {
            const command = new client_dynamodb_1.GetItemCommand({
                TableName: aws_config_1.default.dynamodb.triageTable,
                Key: (0, util_dynamodb_1.marshall)({ triageId })
            });
            const response = await this.client.send(command);
            if (!response.Item) {
                return null;
            }
            const item = (0, util_dynamodb_1.unmarshall)(response.Item);
            // Reconstruct TriageResult from stored data
            return this.reconstructTriageResult(item);
        }
        catch (error) {
            logger_1.default.error('Failed to retrieve triage result', error, { triageId });
            throw new errors_1.DatabaseError('get_triage', {
                triageId,
                error: error.message
            });
        }
    }
    /**
     * Query triage history for a user
     *
     * @param userId - User identifier
     * @param limit - Maximum number of results
     * @returns Array of triage results
     */
    async getUserTriageHistory(userId, limit = 10) {
        try {
            const command = new client_dynamodb_1.QueryCommand({
                TableName: aws_config_1.default.dynamodb.triageTable,
                IndexName: 'UserIdIndex',
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: (0, util_dynamodb_1.marshall)({
                    ':userId': userId
                }),
                ScanIndexForward: false, // Most recent first
                Limit: limit
            });
            const response = await this.client.send(command);
            if (!response.Items || response.Items.length === 0) {
                return [];
            }
            return response.Items.map(item => this.reconstructTriageResult((0, util_dynamodb_1.unmarshall)(item)));
        }
        catch (error) {
            logger_1.default.error('Failed to retrieve user triage history', error, { userId });
            throw new errors_1.DatabaseError('query_user_history', {
                userId,
                error: error.message
            });
        }
    }
    /**
     * Store emergency escalation case
     *
     * @param escalation - Emergency escalation details
     * @returns Emergency case ID
     */
    async storeEmergencyCase(escalation) {
        try {
            const item = {
                emergencyId: (0, uuid_1.v4)(),
                triageId: escalation.triageId,
                urgencyLevel: escalation.urgencyLevel,
                patientInfo: escalation.patientInfo,
                location: escalation.location,
                nearestPhc: escalation.nearestPhc,
                referralNote: escalation.referralNote,
                timestamp: escalation.timestamp,
                notificationSent: escalation.notificationSent,
                status: 'pending',
                // TTL: 180 days for emergency records
                ttl: Math.floor(Date.now() / 1000) + (180 * 24 * 60 * 60)
            };
            const command = new client_dynamodb_1.PutItemCommand({
                TableName: aws_config_1.default.dynamodb.emergencyTable,
                Item: (0, util_dynamodb_1.marshall)(item, { removeUndefinedValues: true })
            });
            await this.client.send(command);
            logger_1.default.logEmergencyEscalation(escalation.triageId, {
                emergencyId: item.emergencyId,
                location: escalation.location
            });
            return item.emergencyId;
        }
        catch (error) {
            logger_1.default.error('Failed to store emergency case', error, {
                triageId: escalation.triageId
            });
            throw new errors_1.DatabaseError('store_emergency', {
                triageId: escalation.triageId,
                error: error.message
            });
        }
    }
    /**
     * Store analytics event for district health intelligence
     *
     * @param event - Analytics event data
     */
    async storeAnalyticsEvent(event) {
        try {
            const item = {
                eventId: event.eventId,
                eventType: event.eventType,
                district: event.district,
                state: event.state,
                symptoms: event.symptoms,
                urgencyLevel: event.urgencyLevel,
                timestamp: event.timestamp,
                anonymized: event.anonymized,
                // Partition by date for efficient querying
                datePartition: event.timestamp.split('T')[0],
                // TTL: 365 days for analytics
                ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
            };
            const command = new client_dynamodb_1.PutItemCommand({
                TableName: aws_config_1.default.dynamodb.analyticsTable,
                Item: (0, util_dynamodb_1.marshall)(item, { removeUndefinedValues: true })
            });
            await this.client.send(command);
            logger_1.default.debug('Analytics event stored', {
                eventId: event.eventId,
                eventType: event.eventType
            });
        }
        catch (error) {
            // Don't throw error for analytics failures - log and continue
            logger_1.default.warn('Failed to store analytics event', {
                eventId: event.eventId,
                error: error.message
            });
        }
    }
    /**
     * Batch store multiple analytics events
     *
     * @param events - Array of analytics events
     */
    async batchStoreAnalyticsEvents(events) {
        try {
            const writeRequests = events.map(event => ({
                PutRequest: {
                    Item: (0, util_dynamodb_1.marshall)({
                        eventId: event.eventId,
                        eventType: event.eventType,
                        district: event.district,
                        state: event.state,
                        symptoms: event.symptoms,
                        urgencyLevel: event.urgencyLevel,
                        timestamp: event.timestamp,
                        anonymized: event.anonymized,
                        datePartition: event.timestamp.split('T')[0],
                        ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
                    }, { removeUndefinedValues: true })
                }
            }));
            // DynamoDB batch write limit is 25 items
            const batches = this.chunkArray(writeRequests, 25);
            for (const batch of batches) {
                const command = new client_dynamodb_1.BatchWriteItemCommand({
                    RequestItems: {
                        [aws_config_1.default.dynamodb.analyticsTable]: batch
                    }
                });
                await this.client.send(command);
            }
            logger_1.default.info('Batch analytics events stored', { count: events.length });
        }
        catch (error) {
            logger_1.default.warn('Failed to batch store analytics events', {
                count: events.length,
                error: error.message
            });
        }
    }
    /**
     * Query analytics events for district health intelligence
     *
     * @param district - District name
     * @param startDate - Start date (ISO format)
     * @param endDate - End date (ISO format)
     * @returns Array of analytics events
     */
    async queryDistrictAnalytics(district, startDate, endDate) {
        try {
            const command = new client_dynamodb_1.QueryCommand({
                TableName: aws_config_1.default.dynamodb.analyticsTable,
                IndexName: 'DistrictDateIndex',
                KeyConditionExpression: 'district = :district AND datePartition BETWEEN :startDate AND :endDate',
                ExpressionAttributeValues: (0, util_dynamodb_1.marshall)({
                    ':district': district,
                    ':startDate': startDate.split('T')[0],
                    ':endDate': endDate.split('T')[0]
                })
            });
            const response = await this.client.send(command);
            if (!response.Items || response.Items.length === 0) {
                return [];
            }
            return response.Items.map(item => (0, util_dynamodb_1.unmarshall)(item));
        }
        catch (error) {
            logger_1.default.error('Failed to query district analytics', error, {
                district,
                startDate,
                endDate
            });
            throw new errors_1.DatabaseError('query_analytics', {
                district,
                error: error.message
            });
        }
    }
    /**
     * Update emergency case status
     *
     * @param emergencyId - Emergency case identifier
     * @param status - New status
     */
    async updateEmergencyStatus(emergencyId, status) {
        try {
            const command = new client_dynamodb_1.UpdateItemCommand({
                TableName: aws_config_1.default.dynamodb.emergencyTable,
                Key: (0, util_dynamodb_1.marshall)({ emergencyId }),
                UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
                ExpressionAttributeNames: {
                    '#status': 'status'
                },
                ExpressionAttributeValues: (0, util_dynamodb_1.marshall)({
                    ':status': status,
                    ':updatedAt': new Date().toISOString()
                })
            });
            await this.client.send(command);
            logger_1.default.info('Emergency status updated', { emergencyId, status });
        }
        catch (error) {
            logger_1.default.error('Failed to update emergency status', error, {
                emergencyId,
                status
            });
            throw new errors_1.DatabaseError('update_emergency', {
                emergencyId,
                error: error.message
            });
        }
    }
    /**
     * Helper: Reconstruct TriageResult from DynamoDB item
     */
    reconstructTriageResult(item) {
        return {
            triageId: item.triageId,
            request: {
                userId: item.userId,
                symptoms: item.symptoms,
                language: item.language,
                timestamp: item.timestamp,
                patientAge: item.patientAge,
                patientGender: item.patientGender,
                location: item.location,
                voiceInput: false
            },
            response: {
                urgencyLevel: item.urgencyLevel,
                riskScore: item.riskScore,
                recommendedAction: item.recommendedAction,
                referToPhc: item.referToPhc,
                confidenceScore: item.confidenceScore,
                citedGuideline: item.citedGuideline
            },
            metadata: {
                processingTimeMs: item.processingTimeMs,
                bedrockTokensUsed: item.bedrockTokensUsed,
                guardrailsTriggered: item.guardrailsTriggered,
                retrievedDocuments: item.retrievedDocuments || 0,
                modelVersion: item.modelVersion || aws_config_1.default.bedrock.modelId,
                timestamp: item.timestamp
            }
        };
    }
    /**
     * Helper: Chunk array into smaller batches
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}
exports.DynamoDBService = DynamoDBService;
/**
 * Export singleton instance
 */
exports.dynamoDBService = new DynamoDBService();
exports.default = exports.dynamoDBService;
//# sourceMappingURL=dynamodb.service.js.map