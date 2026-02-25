/**
 * Amazon Bedrock Service
 *
 * Handles all interactions with Amazon Bedrock including:
 * - Knowledge Base retrieval (RAG)
 * - Claude 3 Haiku inference
 * - Guardrails enforcement
 * - Structured JSON output validation
 */
import { TriageRequest, TriageResponse, RAGContext } from '../types/triage.types';
/**
 * Bedrock Service Class
 */
export declare class BedrockService {
    private runtimeClient;
    private agentClient;
    constructor();
    /**
     * Retrieve relevant medical protocols from Knowledge Base
     *
     * @param query - Patient symptoms and context
     * @returns Retrieved documents with relevance scores
     */
    retrieveKnowledgeBase(query: string): Promise<RAGContext>;
    /**
     * Generate triage assessment using Claude 3 Haiku
     *
     * @param request - Triage request with symptoms
     * @param ragContext - Retrieved medical protocols
     * @returns Structured triage response
     */
    generateTriageAssessment(request: TriageRequest, ragContext: RAGContext): Promise<TriageResponse>;
    /**
     * Build context text from retrieved documents
     */
    private buildContextFromDocuments;
    /**
     * Build triage prompt with safety instructions
     */
    private buildTriagePrompt;
    /**
     * Get system prompt with safety instructions
     */
    private getSystemPrompt;
    /**
     * Extract and validate triage response from Claude output
     */
    private extractTriageResponse;
    /**
     * Complete triage pipeline: Retrieve + Generate
     */
    performTriage(request: TriageRequest): Promise<{
        response: TriageResponse;
        ragContext: RAGContext;
        processingTimeMs: number;
    }>;
}
/**
 * Export singleton instance
 */
export declare const bedrockService: BedrockService;
export default bedrockService;
//# sourceMappingURL=bedrock.service.d.ts.map