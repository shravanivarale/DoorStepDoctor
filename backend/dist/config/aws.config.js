"use strict";
/**
 * AWS Configuration Module
 *
 * Centralized configuration for all AWS services used in the triage system.
 * Includes environment-specific settings and service client initialization.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bedrockPricing = exports.languageVoiceMap = exports.config = void 0;
exports.validateConfig = validateConfig;
exports.getEnvironmentConfig = getEnvironmentConfig;
/**
 * Environment variables with validation
 */
exports.config = {
    // AWS Region
    region: process.env.AWS_REGION || 'us-east-1',
    // Amazon Bedrock Configuration
    bedrock: {
        modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
        knowledgeBaseId: process.env.BEDROCK_KB_ID || '',
        maxTokens: parseInt(process.env.BEDROCK_MAX_TOKENS || '400', 10),
        temperature: parseFloat(process.env.BEDROCK_TEMPERATURE || '0.2'),
        topP: parseFloat(process.env.BEDROCK_TOP_P || '0.9'),
        guardrailId: process.env.BEDROCK_GUARDRAIL_ID || '',
        guardrailVersion: process.env.BEDROCK_GUARDRAIL_VERSION || 'DRAFT'
    },
    // DynamoDB Tables
    dynamodb: {
        triageTable: process.env.DYNAMODB_TRIAGE_TABLE || 'asha-triage-records',
        userTable: process.env.DYNAMODB_USER_TABLE || 'asha-users',
        analyticsTable: process.env.DYNAMODB_ANALYTICS_TABLE || 'asha-analytics',
        emergencyTable: process.env.DYNAMODB_EMERGENCY_TABLE || 'asha-emergency-cases'
    },
    // Amazon Cognito
    cognito: {
        userPoolId: process.env.COGNITO_USER_POOL_ID || '',
        clientId: process.env.COGNITO_CLIENT_ID || '',
        region: process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1'
    },
    // Amazon Transcribe
    transcribe: {
        languageCode: process.env.TRANSCRIBE_LANGUAGE_CODE || 'hi-IN',
        sampleRate: parseInt(process.env.TRANSCRIBE_SAMPLE_RATE || '16000', 10),
        mediaFormat: process.env.TRANSCRIBE_MEDIA_FORMAT || 'wav'
    },
    // Amazon Polly
    polly: {
        voiceId: process.env.POLLY_VOICE_ID || 'Aditi', // Hindi voice
        engine: process.env.POLLY_ENGINE || 'neural',
        outputFormat: process.env.POLLY_OUTPUT_FORMAT || 'mp3'
    },
    // S3 Storage
    s3: {
        bucketName: process.env.S3_BUCKET_NAME || 'asha-triage-storage',
        voiceRecordingsPrefix: 'voice-recordings/',
        knowledgeBasePrefix: 'knowledge-base/'
    },
    // CloudWatch Logging
    cloudwatch: {
        logGroupName: process.env.CLOUDWATCH_LOG_GROUP || '/aws/lambda/asha-triage',
        metricsNamespace: process.env.CLOUDWATCH_METRICS_NAMESPACE || 'ASHA-Triage'
    },
    // Application Settings
    app: {
        environment: process.env.ENVIRONMENT || 'development',
        testMode: process.env.TEST_MODE === 'true',
        enableDetailedLogging: process.env.ENABLE_DETAILED_LOGGING === 'true',
        sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30', 10),
        maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10)
    },
    // Cost Optimization
    cost: {
        targetCostPerTriageINR: parseFloat(process.env.TARGET_COST_PER_TRIAGE || '2.0'),
        billingAlertThresholds: [30, 60, 90], // USD
        enableCostTracking: process.env.ENABLE_COST_TRACKING === 'true'
    },
    // Performance Targets
    performance: {
        targetResponseTimeMs: parseInt(process.env.TARGET_RESPONSE_TIME_MS || '2000', 10),
        maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '100', 10)
    },
    // Emergency Escalation
    emergency: {
        phcNotificationEnabled: process.env.PHC_NOTIFICATION_ENABLED === 'true',
        emergencyContactNumber: process.env.EMERGENCY_CONTACT_NUMBER || '108',
        autoEscalationThreshold: parseFloat(process.env.AUTO_ESCALATION_THRESHOLD || '0.8')
    }
};
/**
 * Validate required configuration
 * Throws error if critical configuration is missing
 */
function validateConfig() {
    const requiredFields = [
        { key: 'bedrock.knowledgeBaseId', value: exports.config.bedrock.knowledgeBaseId },
        { key: 'cognito.userPoolId', value: exports.config.cognito.userPoolId },
        { key: 'cognito.clientId', value: exports.config.cognito.clientId }
    ];
    const missingFields = requiredFields.filter(field => !field.value);
    if (missingFields.length > 0) {
        const missing = missingFields.map(f => f.key).join(', ');
        throw new Error(`Missing required configuration: ${missing}`);
    }
}
/**
 * Get configuration for specific environment
 */
function getEnvironmentConfig() {
    // Validate configuration on initialization
    if (!exports.config.app.testMode) {
        validateConfig();
    }
    return exports.config;
}
/**
 * Language-specific voice configurations
 */
exports.languageVoiceMap = {
    'hi-IN': { voiceId: 'Aditi', languageCode: 'hi-IN' },
    'mr-IN': { voiceId: 'Aditi', languageCode: 'hi-IN' }, // Fallback to Hindi
    'ta-IN': { voiceId: 'Aditi', languageCode: 'hi-IN' }, // Fallback to Hindi
    'te-IN': { voiceId: 'Aditi', languageCode: 'hi-IN' }, // Fallback to Hindi
    'kn-IN': { voiceId: 'Aditi', languageCode: 'hi-IN' }, // Fallback to Hindi
    'bn-IN': { voiceId: 'Aditi', languageCode: 'hi-IN' }, // Fallback to Hindi
    'en-IN': { voiceId: 'Kajal', languageCode: 'en-IN' }
};
/**
 * Bedrock model pricing (approximate, in USD)
 */
exports.bedrockPricing = {
    'anthropic.claude-3-haiku-20240307-v1:0': {
        inputTokensPer1k: 0.00025,
        outputTokensPer1k: 0.00125
    }
};
/**
 * Export singleton config instance
 */
exports.default = exports.config;
//# sourceMappingURL=aws.config.js.map