/**
 * Unit Tests for Logger Utility
 */

import { logger, LogLevel } from '../../src/utils/logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  
  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    logger.clearContext();
  });
  
  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
  
  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test message', { key: 'value' });
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe(LogLevel.INFO);
      expect(loggedData.message).toBe('Test message');
      expect(loggedData.context.key).toBe('value');
    });
  });
  
  describe('error', () => {
    it('should log error messages with error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error, { userId: 'test-123' });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe(LogLevel.ERROR);
      expect(loggedData.message).toBe('Error occurred');
      expect(loggedData.error.message).toBe('Test error');
    });
  });
  
  describe('context management', () => {
    it('should set and clear context', () => {
      logger.setContext({ requestId: 'req-123' });
      logger.info('Test with context');
      
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.context.requestId).toBe('req-123');
      
      logger.clearContext();
      logger.info('Test without context');
      
      const loggedData2 = JSON.parse(consoleLogSpy.mock.calls[1][0]);
      expect(loggedData2.context.requestId).toBeUndefined();
    });
  });
  
  describe('logTriageEvent', () => {
    it('should log triage events with proper structure', () => {
      logger.logTriageEvent('triage-123', 'triage_completed', {
        urgencyLevel: 'medium',
        riskScore: 0.5
      });
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.context.triageId).toBe('triage-123');
      expect(loggedData.context.eventType).toBe('triage');
    });
  });
  
  describe('logPerformance', () => {
    it('should log performance metrics', () => {
      logger.logPerformance('bedrock_inference', 1500, {
        tokensUsed: 350
      });
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.context.operation).toBe('bedrock_inference');
      expect(loggedData.context.durationMs).toBe(1500);
      expect(loggedData.context.eventType).toBe('performance');
    });
  });
});
