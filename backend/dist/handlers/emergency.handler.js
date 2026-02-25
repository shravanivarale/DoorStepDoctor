"use strict";
/**
 * Emergency Escalation Lambda Handler
 *
 * Handles emergency case management, PHC notifications,
 * and emergency queue queries for PHC dashboard.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmergencyCasesHandler = getEmergencyCasesHandler;
exports.updateEmergencyStatusHandler = updateEmergencyStatusHandler;
exports.getEmergencyContactHandler = getEmergencyContactHandler;
const emergency_service_1 = __importDefault(require("../services/emergency.service"));
const dynamodb_service_1 = __importDefault(require("../services/dynamodb.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
/**
 * Get emergency cases for PHC dashboard
 */
async function getEmergencyCasesHandler(event, context) {
    const requestId = context.awsRequestId;
    logger_1.default.setContext({ requestId, handler: 'getEmergencyCases' });
    try {
        const district = event.queryStringParameters?.district;
        const status = event.queryStringParameters?.status || 'pending';
        if (!district) {
            throw new errors_1.ValidationError('district query parameter is required');
        }
        logger_1.default.info('Fetching emergency cases', { district, status });
        // In production, query DynamoDB for emergency cases by district
        // For now, return mock data
        const emergencyCases = [];
        const response = {
            success: true,
            data: emergencyCases,
            metadata: {
                requestId,
                timestamp: new Date().toISOString(),
                processingTimeMs: 0
            }
        };
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(response)
        };
    }
    catch (error) {
        logger_1.default.error('Failed to fetch emergency cases', error, { requestId });
        return handleEmergencyError(error, requestId);
    }
    finally {
        logger_1.default.clearContext();
    }
}
/**
 * Update emergency case status
 */
async function updateEmergencyStatusHandler(event, context) {
    const requestId = context.awsRequestId;
    logger_1.default.setContext({ requestId, handler: 'updateEmergencyStatus' });
    try {
        if (!event.body) {
            throw new errors_1.ValidationError('Request body is required');
        }
        const { emergencyId, status } = JSON.parse(event.body);
        if (!emergencyId || !status) {
            throw new errors_1.ValidationError('emergencyId and status are required');
        }
        if (!['pending', 'acknowledged', 'resolved'].includes(status)) {
            throw new errors_1.ValidationError('Invalid status value');
        }
        logger_1.default.info('Updating emergency status', { emergencyId, status });
        await dynamodb_service_1.default.updateEmergencyStatus(emergencyId, status);
        const response = {
            success: true,
            data: { message: 'Emergency status updated successfully' },
            metadata: {
                requestId,
                timestamp: new Date().toISOString(),
                processingTimeMs: 0
            }
        };
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(response)
        };
    }
    catch (error) {
        logger_1.default.error('Failed to update emergency status', error, { requestId });
        return handleEmergencyError(error, requestId);
    }
    finally {
        logger_1.default.clearContext();
    }
}
/**
 * Get emergency contact information
 */
async function getEmergencyContactHandler(_event, context) {
    const requestId = context.awsRequestId;
    logger_1.default.setContext({ requestId, handler: 'getEmergencyContact' });
    try {
        const emergencyContact = emergency_service_1.default.getEmergencyContact();
        const response = {
            success: true,
            data: { contact: emergencyContact },
            metadata: {
                requestId,
                timestamp: new Date().toISOString(),
                processingTimeMs: 0
            }
        };
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(response)
        };
    }
    catch (error) {
        logger_1.default.error('Failed to get emergency contact', error, { requestId });
        return handleEmergencyError(error, requestId);
    }
    finally {
        logger_1.default.clearContext();
    }
}
/**
 * Handle emergency errors
 */
function handleEmergencyError(error, requestId) {
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof errors_1.ValidationError) {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        errorMessage = error.message;
    }
    const response = {
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
        body: JSON.stringify(response)
    };
}
//# sourceMappingURL=emergency.handler.js.map