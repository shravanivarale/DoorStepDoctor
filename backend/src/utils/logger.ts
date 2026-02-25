/**
 * Structured Logging Utility
 * 
 * Provides consistent logging across all Lambda functions with
 * CloudWatch integration and structured JSON output.
 */

import config from '../config/aws.config';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  requestId?: string;
  userId?: string;
  triageId?: string;
}

/**
 * Logger class for structured logging
 */
class Logger {
  private context: Record<string, unknown> = {};
  
  /**
   * Set context that will be included in all log entries
   */
  setContext(context: Record<string, unknown>): void {
    this.context = { ...this.context, ...context };
  }
  
  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }
  
  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    additionalContext?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...additionalContext }
    };
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: config.app.enableDetailedLogging ? error.stack : undefined
      };
    }
    
    return entry;
  }
  
  /**
   * Output log entry
   */
  private log(entry: LogEntry): void {
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
  debug(message: string, context?: Record<string, unknown>): void {
    if (config.app.enableDetailedLogging) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
      this.log(entry);
    }
  }
  
  /**
   * Info level logging
   */
  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.log(entry);
  }
  
  /**
   * Warning level logging
   */
  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.log(entry);
  }
  
  /**
   * Error level logging
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.log(entry);
  }
  
  /**
   * Fatal level logging
   */
  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.FATAL, message, context, error);
    this.log(entry);
  }
  
  /**
   * Log triage event
   */
  logTriageEvent(
    triageId: string,
    event: string,
    details?: Record<string, unknown>
  ): void {
    this.info(`Triage Event: ${event}`, {
      triageId,
      eventType: 'triage',
      ...details
    });
  }
  
  /**
   * Log emergency escalation
   */
  logEmergencyEscalation(
    triageId: string,
    details: Record<string, unknown>
  ): void {
    this.warn('Emergency Escalation Triggered', {
      triageId,
      eventType: 'emergency',
      ...details
    });
  }
  
  /**
   * Log guardrail trigger
   */
  logGuardrailTrigger(
    triageId: string,
    triggerType: string,
    details?: Record<string, unknown>
  ): void {
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
  logPerformance(
    operation: string,
    durationMs: number,
    details?: Record<string, unknown>
  ): void {
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
  logCost(
    triageId: string,
    cost: number,
    currency: string,
    breakdown?: Record<string, number>
  ): void {
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
export const logger = new Logger();

/**
 * Create child logger with specific context
 */
export function createLogger(context: Record<string, unknown>): Logger {
  const childLogger = new Logger();
  childLogger.setContext(context);
  return childLogger;
}

export default logger;