/**
 * Custom Error Classes
 *
 * Defines application-specific error types for better error handling
 * and debugging throughout the triage system.
 */
/**
 * Base application error
 */
export declare class ApplicationError extends Error {
    code: string;
    statusCode: number;
    details?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, statusCode?: number, details?: Record<string, unknown> | undefined);
    toJSON(): {
        error: {
            code: string;
            message: string;
            details: Record<string, unknown> | undefined;
            timestamp: string;
        };
    };
}
/**
 * Validation error - invalid input data
 */
export declare class ValidationError extends ApplicationError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * Authentication error - invalid credentials or session
 */
export declare class AuthenticationError extends ApplicationError {
    constructor(message?: string, details?: Record<string, unknown>);
}
/**
 * Authorization error - insufficient permissions
 */
export declare class AuthorizationError extends ApplicationError {
    constructor(message?: string, details?: Record<string, unknown>);
}
/**
 * Not found error - resource doesn't exist
 */
export declare class NotFoundError extends ApplicationError {
    constructor(resource: string, identifier?: string);
}
/**
 * Bedrock API error - issues with Amazon Bedrock service
 */
export declare class BedrockError extends ApplicationError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * Knowledge Base error - issues with RAG retrieval
 */
export declare class KnowledgeBaseError extends ApplicationError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * Guardrail violation error - Bedrock Guardrails triggered
 */
export declare class GuardrailViolationError extends ApplicationError {
    constructor(triggerType: string, originalOutput: string, details?: Record<string, unknown>);
}
/**
 * Transcription error - issues with Amazon Transcribe
 */
export declare class TranscriptionError extends ApplicationError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * Voice processing error - issues with voice services (Transcribe/Polly)
 */
export declare class VoiceProcessingError extends ApplicationError {
    constructor(operation: string, details?: Record<string, unknown>);
}
/**
 * DynamoDB error - database operation failures
 */
export declare class DatabaseError extends ApplicationError {
    constructor(operation: string, details?: Record<string, unknown>);
}
/**
 * Rate limit error - too many requests
 */
export declare class RateLimitError extends ApplicationError {
    constructor(limit: number, window: string);
}
/**
 * Timeout error - operation took too long
 */
export declare class TimeoutError extends ApplicationError {
    constructor(operation: string, timeoutMs: number);
}
/**
 * Configuration error - missing or invalid configuration
 */
export declare class ConfigurationError extends ApplicationError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * External service error - third-party service failures
 */
export declare class ExternalServiceError extends ApplicationError {
    constructor(service: string, message: string, details?: Record<string, unknown>);
}
/**
 * Error handler utility
 * Converts unknown errors to ApplicationError instances
 */
export declare function handleError(error: unknown): ApplicationError;
/**
 * Check if error is retryable
 */
export declare function isRetryableError(error: ApplicationError): boolean;
/**
 * Format error for API response
 */
export declare function formatErrorResponse(error: ApplicationError, requestId: string): {
    success: boolean;
    error: {
        code: string;
        message: string;
        details: Record<string, unknown> | undefined;
        timestamp: string;
        requestId: string;
    };
};
//# sourceMappingURL=errors.d.ts.map