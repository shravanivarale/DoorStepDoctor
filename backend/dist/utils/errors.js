"use strict";
/**
 * Custom Error Classes
 *
 * Defines application-specific error types for better error handling
 * and debugging throughout the triage system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalServiceError = exports.ConfigurationError = exports.TimeoutError = exports.RateLimitError = exports.DatabaseError = exports.VoiceProcessingError = exports.TranscriptionError = exports.GuardrailViolationError = exports.KnowledgeBaseError = exports.BedrockError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ApplicationError = void 0;
exports.handleError = handleError;
exports.isRetryableError = isRetryableError;
exports.formatErrorResponse = formatErrorResponse;
/**
 * Base application error
 */
class ApplicationError extends Error {
    constructor(message, code, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            error: {
                code: this.code,
                message: this.message,
                details: this.details,
                timestamp: new Date().toISOString()
            }
        };
    }
}
exports.ApplicationError = ApplicationError;
/**
 * Validation error - invalid input data
 */
class ValidationError extends ApplicationError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', 400, details);
    }
}
exports.ValidationError = ValidationError;
/**
 * Authentication error - invalid credentials or session
 */
class AuthenticationError extends ApplicationError {
    constructor(message = 'Authentication failed', details) {
        super(message, 'AUTHENTICATION_ERROR', 401, details);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Authorization error - insufficient permissions
 */
class AuthorizationError extends ApplicationError {
    constructor(message = 'Insufficient permissions', details) {
        super(message, 'AUTHORIZATION_ERROR', 403, details);
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Not found error - resource doesn't exist
 */
class NotFoundError extends ApplicationError {
    constructor(resource, identifier) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;
        super(message, 'NOT_FOUND', 404, { resource, identifier });
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Bedrock API error - issues with Amazon Bedrock service
 */
class BedrockError extends ApplicationError {
    constructor(message, details) {
        super(message, 'BEDROCK_ERROR', 500, details);
    }
}
exports.BedrockError = BedrockError;
/**
 * Knowledge Base error - issues with RAG retrieval
 */
class KnowledgeBaseError extends ApplicationError {
    constructor(message, details) {
        super(message, 'KNOWLEDGE_BASE_ERROR', 500, details);
    }
}
exports.KnowledgeBaseError = KnowledgeBaseError;
/**
 * Guardrail violation error - Bedrock Guardrails triggered
 */
class GuardrailViolationError extends ApplicationError {
    constructor(triggerType, originalOutput, details) {
        super(`Guardrail triggered: ${triggerType}`, 'GUARDRAIL_VIOLATION', 400, { triggerType, originalOutput, ...details });
    }
}
exports.GuardrailViolationError = GuardrailViolationError;
/**
 * Transcription error - issues with Amazon Transcribe
 */
class TranscriptionError extends ApplicationError {
    constructor(message, details) {
        super(message, 'TRANSCRIPTION_ERROR', 500, details);
    }
}
exports.TranscriptionError = TranscriptionError;
/**
 * Voice processing error - issues with voice services (Transcribe/Polly)
 */
class VoiceProcessingError extends ApplicationError {
    constructor(operation, details) {
        super(`Voice processing failed: ${operation}`, 'VOICE_PROCESSING_ERROR', 500, { operation, ...details });
    }
}
exports.VoiceProcessingError = VoiceProcessingError;
/**
 * DynamoDB error - database operation failures
 */
class DatabaseError extends ApplicationError {
    constructor(operation, details) {
        super(`Database operation failed: ${operation}`, 'DATABASE_ERROR', 500, { operation, ...details });
    }
}
exports.DatabaseError = DatabaseError;
/**
 * Rate limit error - too many requests
 */
class RateLimitError extends ApplicationError {
    constructor(limit, window) {
        super(`Rate limit exceeded: ${limit} requests per ${window}`, 'RATE_LIMIT_EXCEEDED', 429, { limit, window });
    }
}
exports.RateLimitError = RateLimitError;
/**
 * Timeout error - operation took too long
 */
class TimeoutError extends ApplicationError {
    constructor(operation, timeoutMs) {
        super(`Operation timed out: ${operation} (${timeoutMs}ms)`, 'TIMEOUT_ERROR', 504, { operation, timeoutMs });
    }
}
exports.TimeoutError = TimeoutError;
/**
 * Configuration error - missing or invalid configuration
 */
class ConfigurationError extends ApplicationError {
    constructor(message, details) {
        super(message, 'CONFIGURATION_ERROR', 500, details);
    }
}
exports.ConfigurationError = ConfigurationError;
/**
 * External service error - third-party service failures
 */
class ExternalServiceError extends ApplicationError {
    constructor(service, message, details) {
        super(`External service error (${service}): ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, { service, ...details });
    }
}
exports.ExternalServiceError = ExternalServiceError;
/**
 * Error handler utility
 * Converts unknown errors to ApplicationError instances
 */
function handleError(error) {
    if (error instanceof ApplicationError) {
        return error;
    }
    if (error instanceof Error) {
        return new ApplicationError(error.message, 'INTERNAL_ERROR', 500, { originalError: error.name, stack: error.stack });
    }
    return new ApplicationError('An unknown error occurred', 'UNKNOWN_ERROR', 500, { error: String(error) });
}
/**
 * Check if error is retryable
 */
function isRetryableError(error) {
    const retryableCodes = [
        'TIMEOUT_ERROR',
        'EXTERNAL_SERVICE_ERROR',
        'BEDROCK_ERROR',
        'DATABASE_ERROR'
    ];
    return retryableCodes.includes(error.code) && error.statusCode >= 500;
}
/**
 * Format error for API response
 */
function formatErrorResponse(error, requestId) {
    return {
        success: false,
        error: {
            code: error.code,
            message: error.message,
            details: error.details,
            timestamp: new Date().toISOString(),
            requestId
        }
    };
}
//# sourceMappingURL=errors.js.map