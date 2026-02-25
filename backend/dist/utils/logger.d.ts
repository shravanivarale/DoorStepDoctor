/**
 * Structured Logging Utility
 *
 * Provides consistent logging across all Lambda functions with
 * CloudWatch integration and structured JSON output.
 */
/**
 * Log levels
 */
export declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    FATAL = "FATAL"
}
/**
 * Logger class for structured logging
 */
declare class Logger {
    private context;
    /**
     * Set context that will be included in all log entries
     */
    setContext(context: Record<string, unknown>): void;
    /**
     * Clear context
     */
    clearContext(): void;
    /**
     * Create log entry
     */
    private createLogEntry;
    /**
     * Output log entry
     */
    private log;
    /**
     * Debug level logging
     */
    debug(message: string, context?: Record<string, unknown>): void;
    /**
     * Info level logging
     */
    info(message: string, context?: Record<string, unknown>): void;
    /**
     * Warning level logging
     */
    warn(message: string, context?: Record<string, unknown>): void;
    /**
     * Error level logging
     */
    error(message: string, error?: Error, context?: Record<string, unknown>): void;
    /**
     * Fatal level logging
     */
    fatal(message: string, error?: Error, context?: Record<string, unknown>): void;
    /**
     * Log triage event
     */
    logTriageEvent(triageId: string, event: string, details?: Record<string, unknown>): void;
    /**
     * Log emergency escalation
     */
    logEmergencyEscalation(triageId: string, details: Record<string, unknown>): void;
    /**
     * Log guardrail trigger
     */
    logGuardrailTrigger(triageId: string, triggerType: string, details?: Record<string, unknown>): void;
    /**
     * Log performance metric
     */
    logPerformance(operation: string, durationMs: number, details?: Record<string, unknown>): void;
    /**
     * Log cost tracking
     */
    logCost(triageId: string, cost: number, currency: string, breakdown?: Record<string, number>): void;
}
/**
 * Export singleton logger instance
 */
export declare const logger: Logger;
/**
 * Create child logger with specific context
 */
export declare function createLogger(context: Record<string, unknown>): Logger;
export default logger;
//# sourceMappingURL=logger.d.ts.map