/**
 * Main Entry Point
 *
 * Exports all services, handlers, and utilities for the AI Triage Engine.
 */
export { bedrockService } from './services/bedrock.service';
export { dynamoDBService } from './services/dynamodb.service';
export { voiceService } from './services/voice.service';
export { emergencyService } from './services/emergency.service';
export { authService } from './services/auth.service';
export { handler as triageHandler } from './handlers/triage';
export { loginHandler, registerHandler, validateTokenHandler, confirmRegistrationHandler } from './handlers/auth';
export { speechToTextHandler, textToSpeechHandler, detectLanguageHandler } from './handlers/voice';
export { getEmergencyCasesHandler, updateEmergencyStatusHandler, getEmergencyContactHandler } from './handlers/emergency';
export { default as config } from './config/aws.config';
export { logger } from './utils/logger';
export * from './types/triage.types';
export * from './utils/errors';
//# sourceMappingURL=index.d.ts.map