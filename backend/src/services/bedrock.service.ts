/**
 * Amazon Bedrock Service
 * 
 * Handles all interactions with Amazon Bedrock including:
 * - Knowledge Base retrieval (RAG)
 * - Claude 3 Haiku inference
 * - Guardrails enforcement
 * - Structured JSON output validation
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput
} from '@aws-sdk/client-bedrock-runtime';
import {
  BedrockAgentRuntimeClient,
  RetrieveCommand,
  RetrieveCommandInput
} from '@aws-sdk/client-bedrock-agent-runtime';

import config from '../config/aws.config';
import logger from '../utils/logger';
import {
  BedrockError,
  GuardrailViolationError,
  KnowledgeBaseError
} from '../utils/errors';
import {
  TriageRequest,
  TriageResponse,
  TriageResponseSchema,
  RAGContext
} from '../types/triage.types';

/**
 * Bedrock Service Class
 */
export class BedrockService {
  private runtimeClient: BedrockRuntimeClient;
  private agentClient: BedrockAgentRuntimeClient;
  
  constructor() {
    this.runtimeClient = new BedrockRuntimeClient({ region: config.region });
    this.agentClient = new BedrockAgentRuntimeClient({ region: config.region });
  }
  
  /**
   * Retrieve relevant medical protocols from Knowledge Base
   * 
   * @param query - Patient symptoms and context
   * @returns Retrieved documents with relevance scores
   */
  async retrieveKnowledgeBase(query: string): Promise<RAGContext> {
    const startTime = Date.now();
    
    try {
      logger.debug('Retrieving from Knowledge Base', { query });
      
      const input: RetrieveCommandInput = {
        knowledgeBaseId: config.bedrock.knowledgeBaseId,
        retrievalQuery: {
          text: query
        },
        retrievalConfiguration: {
          vectorSearchConfiguration: {
            numberOfResults: 5 // Top-5 documents for context
          }
        }
      };
      
      const command = new RetrieveCommand(input);
      const response = await this.agentClient.send(command);
      
      const retrievalTimeMs = Date.now() - startTime;
      
      // Extract and format retrieved documents
      const retrievedDocuments = (response.retrievalResults || []).map(result => ({
        documentId: result.location?.s3Location?.uri || 'unknown',
        title: result.metadata?.title || 'Medical Protocol',
        excerpt: result.content?.text || '',
        relevanceScore: result.score || 0
      }));
      
      logger.info('Knowledge Base retrieval successful', {
        documentsRetrieved: retrievedDocuments.length,
        retrievalTimeMs
      });
      
      return {
        query,
        retrievedDocuments,
        totalDocuments: retrievedDocuments.length,
        retrievalTimeMs
      };
      
    } catch (error) {
      logger.error('Knowledge Base retrieval failed', error as Error, { query });
      throw new KnowledgeBaseError(
        'Failed to retrieve medical protocols',
        { query, error: (error as Error).message }
      );
    }
  }
  
  /**
   * Generate triage assessment using Claude 3 Haiku
   * 
   * @param request - Triage request with symptoms
   * @param ragContext - Retrieved medical protocols
   * @returns Structured triage response
   */
  async generateTriageAssessment(
    request: TriageRequest,
    ragContext: RAGContext
  ): Promise<TriageResponse> {
    const startTime = Date.now();
    
    try {
      // Build context from retrieved documents
      const contextText = this.buildContextFromDocuments(ragContext);
      
      // Construct prompt with safety instructions
      const prompt = this.buildTriagePrompt(request, contextText);
      
      logger.debug('Invoking Claude 3 Haiku', {
        modelId: config.bedrock.modelId,
        promptLength: prompt.length
      });
      
      // Prepare Bedrock API request
      const input: InvokeModelCommandInput = {
        modelId: config.bedrock.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: config.bedrock.maxTokens,
          temperature: config.bedrock.temperature,
          top_p: config.bedrock.topP,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          system: this.getSystemPrompt()
        }),
        guardrailIdentifier: config.bedrock.guardrailId || undefined,
        guardrailVersion: config.bedrock.guardrailVersion || undefined
      };
      
      const command = new InvokeModelCommand(input);
      const response = await this.runtimeClient.send(command);
      
      // Parse response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      // Check for guardrail triggers
      if (response.trace) {
        logger.logGuardrailTrigger(
          request.userId,
          'guardrail_check',
          { trace: response.trace }
        );
      }
      
      // Extract and validate structured output
      const triageResponse = this.extractTriageResponse(responseBody);
      
      const processingTimeMs = Date.now() - startTime;
      
      logger.logPerformance('bedrock_inference', processingTimeMs, {
        tokensUsed: responseBody.usage?.total_tokens || 0,
        modelId: config.bedrock.modelId
      });
      
      return triageResponse;
      
    } catch (error) {
      logger.error('Bedrock inference failed', error as Error, {
        userId: request.userId,
        symptoms: request.symptoms
      });
      throw new BedrockError(
        'Failed to generate triage assessment',
        { error: (error as Error).message }
      );
    }
  }
  
  /**
   * Build context text from retrieved documents
   */
  private buildContextFromDocuments(ragContext: RAGContext): string {
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
  private buildTriagePrompt(request: TriageRequest, context: string): string {
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
  private getSystemPrompt(): string {
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
  private extractTriageResponse(responseBody: any): TriageResponse {
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
      const validatedResponse = TriageResponseSchema.parse(parsedResponse);
      
      return validatedResponse;
      
    } catch (error) {
      logger.error('Failed to extract triage response', error as Error, {
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
  async performTriage(request: TriageRequest): Promise<{
    response: TriageResponse;
    ragContext: RAGContext;
    processingTimeMs: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Step 1: Retrieve relevant medical protocols
      const ragContext = await this.retrieveKnowledgeBase(request.symptoms);
      
      // Step 2: Generate triage assessment
      const response = await this.generateTriageAssessment(request, ragContext);
      
      const processingTimeMs = Date.now() - startTime;
      
      logger.logTriageEvent(request.userId, 'triage_completed', {
        urgencyLevel: response.urgencyLevel,
        riskScore: response.riskScore,
        processingTimeMs
      });
      
      return {
        response,
        ragContext,
        processingTimeMs
      };
      
    } catch (error) {
      logger.error('Triage pipeline failed', error as Error, {
        userId: request.userId
      });
      throw error;
    }
  }
}

/**
 * Export singleton instance
 */
export const bedrockService = new BedrockService();
export default bedrockService;