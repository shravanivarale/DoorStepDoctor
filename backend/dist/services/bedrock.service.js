"use strict";
/**
 * Amazon Bedrock Service
 *
 * Handles all interactions with Amazon Bedrock including:
 * - Knowledge Base retrieval (RAG)
 * - Claude 3 Haiku inference
 * - Guardrails enforcement
 * - Structured JSON output validation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bedrockService = exports.BedrockService = void 0;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const client_bedrock_agent_runtime_1 = require("@aws-sdk/client-bedrock-agent-runtime");
const aws_config_1 = __importDefault(require("../config/aws.config"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const triage_types_1 = require("../types/triage.types");
/**
 * Bedrock Service Class
 */
class BedrockService {
    constructor() {
        this.runtimeClient = new client_bedrock_runtime_1.BedrockRuntimeClient({ region: aws_config_1.default.region });
        this.agentClient = new client_bedrock_agent_runtime_1.BedrockAgentRuntimeClient({ region: aws_config_1.default.region });
    }
    /**
     * Retrieve relevant medical protocols from Knowledge Base
     *
     * @param query - Patient symptoms and context
     * @returns Retrieved documents with relevance scores
     */
    async retrieveKnowledgeBase(query) {
        const startTime = Date.now();
        try {
            logger_1.default.debug('Retrieving from Knowledge Base', { query });
            const input = {
                knowledgeBaseId: aws_config_1.default.bedrock.knowledgeBaseId,
                retrievalQuery: {
                    text: query
                },
                retrievalConfiguration: {
                    vectorSearchConfiguration: {
                        numberOfResults: 5 // Top-5 documents for context
                    }
                }
            };
            const command = new client_bedrock_agent_runtime_1.RetrieveCommand(input);
            const response = await this.agentClient.send(command);
            const retrievalTimeMs = Date.now() - startTime;
            // Extract and format retrieved documents
            const retrievedDocuments = (response.retrievalResults || []).map(result => ({
                documentId: result.location?.s3Location?.uri || 'unknown',
                title: String(result.metadata?.title || 'Medical Protocol'),
                excerpt: result.content?.text || '',
                relevanceScore: result.score || 0
            }));
            logger_1.default.info('Knowledge Base retrieval successful', {
                documentsRetrieved: retrievedDocuments.length,
                retrievalTimeMs
            });
            return {
                query,
                retrievedDocuments,
                totalDocuments: retrievedDocuments.length,
                retrievalTimeMs
            };
        }
        catch (error) {
            logger_1.default.error('Knowledge Base retrieval failed', error, { query });
            throw new errors_1.KnowledgeBaseError('Failed to retrieve medical protocols', { query, error: error.message });
        }
    }
    /**
     * Generate triage assessment using Claude 3 Haiku
     *
     * @param request - Triage request with symptoms
     * @param ragContext - Retrieved medical protocols
     * @returns Structured triage response
     */
    async generateTriageAssessment(request, ragContext) {
        const startTime = Date.now();
        try {
            // Build context from retrieved documents
            const contextText = this.buildContextFromDocuments(ragContext);
            // Construct prompt with safety instructions
            const prompt = this.buildTriagePrompt(request, contextText);
            logger_1.default.debug('Invoking Claude 3 Haiku', {
                modelId: aws_config_1.default.bedrock.modelId,
                promptLength: prompt.length
            });
            // Prepare Bedrock API request
            const input = {
                modelId: aws_config_1.default.bedrock.modelId,
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify({
                    anthropic_version: 'bedrock-2023-05-31',
                    max_tokens: aws_config_1.default.bedrock.maxTokens,
                    temperature: aws_config_1.default.bedrock.temperature,
                    top_p: aws_config_1.default.bedrock.topP,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    system: this.getSystemPrompt()
                }),
                guardrailIdentifier: aws_config_1.default.bedrock.guardrailId || undefined,
                guardrailVersion: aws_config_1.default.bedrock.guardrailVersion || undefined
            };
            const command = new client_bedrock_runtime_1.InvokeModelCommand(input);
            const response = await this.runtimeClient.send(command);
            // Parse response
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));
            // Extract and validate structured output
            const triageResponse = this.extractTriageResponse(responseBody);
            const processingTimeMs = Date.now() - startTime;
            logger_1.default.logPerformance('bedrock_inference', processingTimeMs, {
                tokensUsed: responseBody.usage?.total_tokens || 0,
                modelId: aws_config_1.default.bedrock.modelId
            });
            return triageResponse;
        }
        catch (error) {
            logger_1.default.error('Bedrock inference failed', error, {
                userId: request.userId,
                symptoms: request.symptoms
            });
            throw new errors_1.BedrockError('Failed to generate triage assessment', { error: error.message });
        }
    }
    /**
     * Build context text from retrieved documents
     */
    buildContextFromDocuments(ragContext) {
        if (ragContext.retrievedDocuments.length === 0) {
            return 'No specific medical protocols retrieved. Use general triage principles.';
        }
        const contextParts = ragContext.retrievedDocuments.map((doc, index) => {
            return `
[Document ${index + 1}: ${doc.title}]
Relevance Score: ${doc.relevanceScore.toFixed(2)}
Content: ${doc.excerpt}
`;
        });
        return `
Retrieved Medical Protocols:
${contextParts.join('\n---\n')}

Use these protocols to inform your triage assessment.
`;
    }
    /**
     * Build triage prompt with safety instructions
     */
    buildTriagePrompt(request, context) {
        return `
You are an AI triage assistant for rural healthcare in India. Your role is to assess patient symptoms and provide triage guidance to ASHA workers.

CRITICAL SAFETY RULES:
1. DO NOT diagnose medical conditions
2. DO NOT prescribe medications or dosages
3. DO NOT provide treatment plans
4. ONLY assess urgency level and recommend next steps
5. Always recommend consulting a healthcare professional for medical decisions

Patient Information:
- Age: ${request.patientAge || 'Not provided'}
- Gender: ${request.patientGender || 'Not provided'}
- Location: ${request.location?.district || 'Unknown'}, ${request.location?.state || 'Unknown'}
- Symptoms: ${request.symptoms}

${context}

Based on the symptoms and retrieved medical protocols, provide a structured triage assessment in the following JSON format:

{
  "urgencyLevel": "low | medium | high | emergency",
  "riskScore": 0.0-1.0,
  "recommendedAction": "Clear action for ASHA worker",
  "referToPhc": true/false,
  "confidenceScore": 0.0-1.0,
  "citedGuideline": "Reference to protocol used",
  "reasoning": "Brief explanation of assessment",
  "redFlags": ["List any concerning symptoms"]
}

Urgency Level Guidelines:
- low: Non-urgent, can wait for regular appointment
- medium: Should be seen within 24-48 hours
- high: Should be seen within hours
- emergency: Immediate medical attention required

Respond ONLY with valid JSON. No additional text.
`;
    }
    /**
     * Get system prompt with safety instructions
     */
    getSystemPrompt() {
        return `You are a medical triage AI assistant for rural healthcare in India. You help ASHA workers assess patient urgency levels.

STRICT RULES:
- Never diagnose conditions
- Never prescribe medications
- Never provide treatment plans
- Only assess urgency and recommend next steps
- Always output valid JSON in the specified format
- Use simple, clear language
- Be culturally sensitive to Indian rural context
- Cite medical protocols when available

Your goal is to help ASHA workers make informed decisions about patient care escalation.`;
    }
    /**
     * Extract and validate triage response from Claude output
     */
    extractTriageResponse(responseBody) {
        try {
            // Extract content from Claude response
            const content = responseBody.content?.[0]?.text || '';
            // Try to parse JSON from response
            let jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const parsedResponse = JSON.parse(jsonMatch[0]);
            // Validate against schema
            const validatedResponse = triage_types_1.TriageResponseSchema.parse(parsedResponse);
            return validatedResponse;
        }
        catch (error) {
            logger_1.default.error('Failed to extract triage response', error, {
                responseBody
            });
            // Return safe fallback response
            return {
                urgencyLevel: 'medium',
                riskScore: 0.5,
                recommendedAction: 'Unable to complete assessment. Please consult with PHC doctor for evaluation.',
                referToPhc: true,
                confidenceScore: 0.0,
                citedGuideline: 'Fallback response due to parsing error',
                reasoning: 'System encountered an error processing the assessment'
            };
        }
    }
    /**
     * Complete triage pipeline: Retrieve + Generate
     */
    async performTriage(request) {
        const startTime = Date.now();
        try {
            // Step 1: Retrieve relevant medical protocols
            const ragContext = await this.retrieveKnowledgeBase(request.symptoms);
            // Step 2: Generate triage assessment
            const response = await this.generateTriageAssessment(request, ragContext);
            const processingTimeMs = Date.now() - startTime;
            logger_1.default.logTriageEvent(request.userId, 'triage_completed', {
                urgencyLevel: response.urgencyLevel,
                riskScore: response.riskScore,
                processingTimeMs
            });
            return {
                response,
                ragContext,
                processingTimeMs
            };
        }
        catch (error) {
            logger_1.default.error('Triage pipeline failed', error, {
                userId: request.userId
            });
            throw error;
        }
    }
}
exports.BedrockService = BedrockService;
/**
 * Export singleton instance
 */
exports.bedrockService = new BedrockService();
exports.default = exports.bedrockService;
//# sourceMappingURL=bedrock.service.js.map