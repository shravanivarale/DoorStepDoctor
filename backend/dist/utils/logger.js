"use strict";
/**
 * Structured Logging Utility
 *
 * Provides consistent logging across all Lambda functions with
 * CloudWatch integration and structured JSON output.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
exports.createLogger = createLogger;
const aws_config_1 = __importDefault(require("../config/aws.config"));
/**
 * Log levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["FATAL"] = "FATAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Logger class for structured logging
 */
class Logger {
    constructor() {
        this.context = {};
    }
    /**
     * Set context that will be included in all log entries
     */
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
    /**
     * Clear context
     */
    clearContext() {
        this.context = {};
    }
    /**
     * Create log entry
     */
    createLogEntry(level, message, additionalContext, error) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context: { ...this.context, ...additionalContext }
        };
        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
                stack: aws_config_1.default.app.enableDetailedLogging ? error.stack : undefined
            };
        }
        return entry;
    }
    /**
     * Output log entry
     */
    log(entry) {
        const output = JSON.stringify(entry);
        switch (entry.level) {
            case LogLevel.DEBUG:
            case LogLevel.INFO:
                console.log(output);
                break;
            case LogLevel.WARN:
                console.warn(output);
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(output);
                break;
        }
    }
    /**
     * Debug level logging
     */
    debug(message, context) {
        if (aws_config_1.default.app.enableDetailedLogging) {
            const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
            this.log(entry);
        }
    }
    /**
     * Info level logging
     */
    info(message, context) {
        const entry = this.createLogEntry(LogLevel.INFO, message, context);
        this.log(entry);
    }
    /**
     * Warning level logging
     */
    warn(message, context) {
        const entry = this.createLogEntry(LogLevel.WARN, message, context);
        this.log(entry);
    }
    /**
     * Error level logging
     */
    error(message, error, context) {
        const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
        this.log(entry);
    }
    /**
     * Fatal level logging
     */
    fatal(message, error, context) {
        const entry = this.createLogEntry(LogLevel.FATAL, message, context, error);
        this.log(entry);
    }
    /**
     * Log triage event
     */
    logTriageEvent(triageId, event, details) {
        this.info(`Triage Event: ${event}`, {
            triageId,
            eventType: 'triage',
            ...details
        });
    }
    /**
     * Log emergency escalation
     */
    logEmergencyEscalation(triageId, details) {
        this.warn('Emergency Escalation Triggered', {
            triageId,
            eventType: 'emergency',
            ...details
        });
    }
    /**
     * Log guardrail trigger
     */
    logGuardrailTrigger(triageId, triggerType, details) {
        this.warn('Bedrock Guardrail Triggered', {
            triageId,
            triggerType,
            eventType: 'guardrail',
            ...details
        });
    }
    /**
     * Log performance metric
     */
    logPerformance(operation, durationMs, details) {
        this.info(`Performance: ${operation}`, {
            operation,
            durationMs,
            eventType: 'performance',
            ...details
        });
    }
    /**
     * Log cost tracking
     */
    logCost(triageId, cost, currency, breakdown) {
        this.info('Cost Tracking', {
            triageId,
            cost,
            currency,
            breakdown,
            eventType: 'cost'
        });
    }
}
/**
 * Export singleton logger instance
 */
exports.logger = new Logger();
/**
 * Create child logger with specific context
 */
function createLogger(context) {
    const childLogger = new Logger();
    childLogger.setContext(context);
    return childLogger;
}
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map