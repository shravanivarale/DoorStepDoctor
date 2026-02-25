"use strict";
/**
 * Authentication Lambda Handler
 *
 * Handles user authentication, registration, and token validation
 * for ASHA workers and PHC doctors.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = loginHandler;
exports.registerHandler = registerHandler;
exports.validateTokenHandler = validateTokenHandler;
exports.confirmRegistrationHandler = confirmRegistrationHandler;
const auth_service_1 = __importDefault(require("../services/auth.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
/**
 * Login handler
 */
async function loginHandler(event, context) {
    const requestId = context.awsRequestId;
    logger_1.default.setContext({ requestId, handler: 'login' });
    try {
        if (!event.body) {
            throw new errors_1.ValidationError('Request body is required');
        }
        const { username, password } = JSON.parse(event.body);
        if (!username || !password) {
            throw new errors_1.ValidationError('Username and password are required');
        }
        logger_1.default.info('Login attempt', { username });
        const session = await auth_service_1.default.login({ username, password });
        const response = {
            success: true,
            data: session,
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
        logger_1.default.error('Login failed', error, { requestId });
        return handleAuthError(error, requestId);
    }
    finally {
        logger_1.default.clearContext();
    }
}
/**
 * Registration handler
 */
async function registerHandler(event, context) {
    const requestId = context.awsRequestId;
    logger_1.default.setContext({ requestId, handler: 'register' });
    try {
        if (!event.body) {
            throw new errors_1.ValidationError('Request body is required');
        }
        const registrationData = JSON.parse(event.body);
        // Validate required fields
        const requiredFields = ['username', 'password', 'email', 'phoneNumber', 'role', 'district', 'state'];
        for (const field of requiredFields) {
            if (!registrationData[field]) {
                throw new errors_1.ValidationError(`${field} is required`);
            }
        }
        logger_1.default.info('Registration attempt', {
            username: registrationData.username,
            role: registrationData.role
        });
        const userId = await auth_service_1.default.register(registrationData);
        const response = {
            success: true,
            data: { userId },
            metadata: {
                requestId,
                timestamp: new Date().toISOString(),
                processingTimeMs: 0
            }
        };
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(response)
        };
    }
    catch (error) {
        logger_1.default.error('Registration failed', error, { requestId });
        return handleAuthError(error, requestId);
    }
    finally {
        logger_1.default.clearContext();
    }
}
/**
 * Token validation handler
 */
async function validateTokenHandler(event, context) {
    const requestId = context.awsRequestId;
    logger_1.default.setContext({ requestId, handler: 'validateToken' });
    try {
        const token = auth_service_1.default.extractToken(event.headers.Authorization || event.headers.authorization);
        const session = await auth_service_1.default.validateToken(token);
        const response = {
            success: true,
            data: session,
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
        logger_1.default.error('Token validation failed', error, { requestId });
        return handleAuthError(error, requestId);
    }
    finally {
        logger_1.default.clearContext();
    }
}
/**
 * Confirm registration handler
 */
async function confirmRegistrationHandler(event, context) {
    const requestId = context.awsRequestId;
    logger_1.default.setContext({ requestId, handler: 'confirmRegistration' });
    try {
        if (!event.body) {
            throw new errors_1.ValidationError('Request body is required');
        }
        const { username, code } = JSON.parse(event.body);
        if (!username || !code) {
            throw new errors_1.ValidationError('Username and verification code are required');
        }
        await auth_service_1.default.confirmRegistration(username, code);
        const response = {
            success: true,
            data: { message: 'Registration confirmed successfully' },
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
        logger_1.default.error('Registration confirmation failed', error, { requestId });
        return handleAuthError(error, requestId);
    }
    finally {
        logger_1.default.clearContext();
    }
}
/**
 * Handle authentication errors
 */
function handleAuthError(error, requestId) {
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof errors_1.ValidationError) {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        errorMessage = error.message;
    }
    else if (error instanceof errors_1.AuthenticationError) {
        statusCode = 401;
        errorCode = 'AUTHENTICATION_ERROR';
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
//# sourceMappingURL=auth.handler.js.map