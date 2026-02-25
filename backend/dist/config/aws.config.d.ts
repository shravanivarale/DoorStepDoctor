/**
 * AWS Configuration Module
 *
 * Centralized configuration for all AWS services used in the triage system.
 * Includes environment-specific settings and service client initialization.
 */
/**
 * Environment variables with validation
 */
export declare const config: {
    region: string;
    bedrock: {
        modelId: string;
        knowledgeBaseId: string;
        maxTokens: number;
        temperature: number;
        topP: number;
        guardrailId: string;
        guardrailVersion: string;
    };
    dynamodb: {
        triageTable: string;
        userTable: string;
        analyticsTable: string;
        emergencyTable: string;
    };
    cognito: {
        userPoolId: string;
        clientId: string;
        region: string;
    };
    transcribe: {
        languageCode: string;
        sampleRate: number;
        mediaFormat: string;
    };
    polly: {
        voiceId: string;
        engine: string;
        outputFormat: string;
    };
    s3: {
        bucketName: string;
        voiceRecordingsPrefix: string;
        knowledgeBasePrefix: string;
    };
    cloudwatch: {
        logGroupName: string;
        metricsNamespace: string;
    };
    app: {
        environment: string;
        testMode: boolean;
        enableDetailedLogging: boolean;
        sessionTimeoutMinutes: number;
        maxRetries: number;
    };
    cost: {
        targetCostPerTriageINR: number;
        billingAlertThresholds: number[];
        enableCostTracking: boolean;
    };
    performance: {
        targetResponseTimeMs: number;
        maxConcurrentRequests: number;
    };
    emergency: {
        phcNotificationEnabled: boolean;
        emergencyContactNumber: string;
        autoEscalationThreshold: number;
    };
};
/**
 * Validate required configuration
 * Throws error if critical configuration is missing
 */
export declare function validateConfig(): void;
/**
 * Get configuration for specific environment
 */
export declare function getEnvironmentConfig(): typeof config;
/**
 * Language-specific voice configurations
 */
export declare const languageVoiceMap: Record<string, {
    voiceId: string;
    languageCode: string;
}>;
/**
 * Bedrock model pricing (approximate, in USD)
 */
export declare const bedrockPricing: {
    'anthropic.claude-3-haiku-20240307-v1:0': {
        inputTokensPer1k: number;
        outputTokensPer1k: number;
    };
};
/**
 * Export singleton config instance
 */
export default config;
//# sourceMappingURL=aws.config.d.ts.map