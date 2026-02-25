/**
 * Main Entry Point
 * 
 * Exports all services, handlers, and utilities for the AI Triage Engine.
 */

// Services
export { bedrockService } from './services/bedrock.service';
export { dynamoDBService } from './services/dynamodb.service';
export { voiceService } from './services/voice.service';
export { emergencyService } from './services/emergency.service';
export { authService } from './services/auth.service';

// Handlers
export { handler as triageHandler } from './handlers/triage.handler';

// Configuration
export { default as config } from './config/aws.config';

// Logger
export { logger } from './utils/logger';

// Types
export * from './types/triage.types';

// Errors
export * from './utils/errors';
