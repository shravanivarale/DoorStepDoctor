"use strict";
/**
 * Triage Lambda Handler
 *
 * Main API endpoint for processing triage requests from ASHA workers.
 * Orchestrates the complete triage pipeline: RAG retrieval + Claude inference + DynamoDB storage
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const uuid_1 = require("uuid");
const bedrock_service_1 = __importDefault(require("../services/bedrock.service"));
const dynamodb_service_1 = __importDefault(require("../services/dynamodb.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const triage_types_1 = require("../types/triage.types");
/**
 * Main triage handler
 *
 * @param event - API Gateway event
 * @param context - Lambda context
 * @returns API Gateway response
 */
async function handler(event, context) {
    const startTime = Date.now();
    const requestId = context.awsRequestId;
    // Set logging context
    logger_1.default.setContext({ requestId, handler: 'triage' });
    try {
        logger_1.default.info('Triage request received', {
            path: event.path,
            method: event.httpMethod
        });
        // Parse and validate request body
        if (!event.body) {
            throw new errors_1.ValidationError('Request body is required');
        }
        const requestBody = JSON.parse(event.body);
        const triageRequest = triage_types_1.TriageRequestSchema.parse(requestBody);
        logger_1.default.info('Triage request validated', {
            userId: triageRequest.userId,
            language: triageRequest.language,
            voiceInput: triageRequest.voiceInput
        });
        // Perform triage using Bedrock RAG pipeline
        const { response, ragContext, processingTimeMs } = await bedrock_service_1.default.performTriage(triageRequest);
        // Create triage result
        const triageResult = {
            triageId: (0, uuid_1.v4)(),
            request: triageRequest,
            response,
            metadata: {
                processingTimeMs,
                bedrockTokensUsed: 0, // Will be populated from Bedrock response
                guardrailsTriggered: false,
                retrievedDocuments: ragContext.totalDocuments,
                modelVersion: 'anthropic.claude-3-haiku-20240307-v1:0',
                timestamp: new Date().toISOString()
            }
        };
        // Store triage result in DynamoDB
        await dynamodb_service_1.default.storeTriageResult(triageResult);
        // Store analytics event for district health intelligence
        const analyticsEvent = {
            eventId: (0, uuid_1.v4)(),
            eventType: 'triage',
            district: triageRequest.location?.district || 'unknown',
            state: triageRequest.location?.state || 'unknown',
            symptoms: [triageRequest.symptoms],
            urgencyLevel: response.urgencyLevel,
            timestamp: new Date().toISOString(),
            anonymized: true
        };
        await dynamodb_service_1.default.storeAnalyticsEvent(analyticsEvent);
        // Handle emergency escalation if needed
        if (response.urgencyLevel === 'emergency') {
            logger_1.default.logEmergencyEscalation(triageResult.triageId, {
                riskScore: response.riskScore,
                location: triageRequest.location
            });
            // Emergency escalation will be handled by a separate service
            // For now, just log the event
        }
        const totalProcessingTime = Date.now() - startTime;
        logger_1.default.logPerformance('triage_complete', totalProcessingTime, {
            triageId: triageResult.triageId,
            urgencyLevel: response.urgencyLevel,
            riskScore: response.riskScore
        });
        // Build API response
        const apiResponse = {
            success: true,
            data: triageResult,
            metadata: {
                requestId,
                timestamp: new Date().toISOString(),
                processingTimeMs: totalProcessingTime
            }
        };
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(apiResponse)
        };
    }
    catch (error) {
        logger_1.default.error('Triage request failed', error, { requestId });
        return handleError(error, requestId);
    }
    finally {
        logger_1.default.clearContext();
    }
}
/**
 * Handle errors and return appropriate API response
 */
function handleError(error, requestId) {
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof errors_1.ValidationError) {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        errorMessage = error.message;
    }
    else if (error instanceof errors_1.BedrockError) {
        statusCode = 503;
        errorCode = 'BEDROCK_ERROR';
        errorMessage = 'AI service temporarily unavailable';
    }
    else if (error instanceof errors_1.DatabaseError) {
        statusCode = 503;
        errorCode = 'DATABASE_ERROR';
        errorMessage = 'Database service temporarily unavailable';
    }
    const apiResponse = {
        success: false,
        error: {
            code: errorCode,
            message: errorMessage,
            timestamp: new Date().toISOString(),
            requestId
        }
    };
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(apiResponse)
    };
}
//# sourceMappingURL=triage.handler.js.map