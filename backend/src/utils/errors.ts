/**
 * Custom Error Classes
 * 
 * Defines application-specific error types for better error handling
 * and debugging throughout the triage system.
 */

/**
 * Base application error
 */
export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
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

/**
 * Validation error - invalid input data
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Authentication error - invalid credentials or session
 */
export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication failed', details?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
  }
}

/**
 * Authorization error - insufficient permissions
 */
export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Insufficient permissions', details?: Record<string, unknown>) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
  }
}

/**
 * Not found error - resource doesn't exist
 */
export class NotFoundError extends ApplicationError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, { resource, identifier });
  }
}

/**
 * Bedrock API error - issues with Amazon Bedrock service
 */
export class BedrockError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'BEDROCK_ERROR', 500, details);
  }
}

/**
 * Knowledge Base error - issues with RAG retrieval
 */
export class KnowledgeBaseError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'KNOWLEDGE_BASE_ERROR', 500, details);
  }
}

/**
 * Guardrail violation error - Bedrock Guardrails triggered
 */
export class GuardrailViolationError extends ApplicationError {
  constructor(
    triggerType: string,
    originalOutput: string,
    details?: Record<string, unknown>
  ) {
    super(
      `Guardrail triggered: ${triggerType}`,
      'GUARDRAIL_VIOLATION',
      400,
      { triggerType, originalOutput, ...details }
    );
  }
}

/**
 * Transcription error - issues with Amazon Transcribe
 */
export class TranscriptionError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TRANSCRIPTION_ERROR', 500, details);
  }
}

/**
 * DynamoDB error - database operation failures
 */
export class DatabaseError extends ApplicationError {
  constructor(operation: string, details?: Record<string, unknown>) {
    super(
      `Database operation failed: ${operation}`,
      'DATABASE_ERROR',
      500,
      { operation, ...details }
    );
  }
}

/**
 * Rate limit error - too many requests
 */
export class RateLimitError extends ApplicationError {
  constructor(limit: number, window: string) {
    super(
      `Rate limit exceeded: ${limit} requests per ${window}`,
      'RATE_LIMIT_EXCEEDED',
      429,
      { limit, window }
    );
  }
}

/**
 * Timeout error - operation took too long
 */
export class TimeoutError extends ApplicationError {
  constructor(operation: string, timeoutMs: number) {
    super(
      `Operation timed out: ${operation} (${timeoutMs}ms)`,
      'TIMEOUT_ERROR',
      504,
      { operation, timeoutMs }
    );
  }
}

/**
 * Configuration error - missing or invalid configuration
 */
export class ConfigurationError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', 500, details);
  }
}

/**
 * External service error - third-party service failures
 */
export class ExternalServiceError extends ApplicationError {
  constructor(service: string, message: string, details?: Record<string, unknown>) {
    super(
      `External service error (${service}): ${message}`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      { service, ...details }
    );
  }
}

/**
 * Error handler utility
 * Converts unknown errors to ApplicationError instances
 */
export function handleError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ApplicationError(
      error.message,
      'INTERNAL_ERROR',
      500,
      { originalError: error.name, stack: error.stack }
    );
  }
  
  return new ApplicationError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    { error: String(error) }
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApplicationError): boolean {
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
export function formatErrorResponse(error: ApplicationError, requestId: string) {
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