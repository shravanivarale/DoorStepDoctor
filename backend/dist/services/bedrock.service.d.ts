/**
 * Amazon Bedrock Service
 *
 * Handles all interactions with Amazon Bedrock including:
 * - Knowledge Base retrieval (RAG)
 * - Claude 3 Haiku inference
 * - Guardrails enforcement
 * - Structured JSON output validation
 *
 * GUARDRAIL POLICY: blocks medical diagnosis, medication dosage,
 * harmful advice. PII detection: confirm from console.
 * Fallback: static safe escalation message. Cost: $0.00075/call.
 */
import { TriageRequest, TriageResponse, RAGContext } from '../types/triage.types';
/**
 * Bedrock Service Class
 */
export declare class BedrockService {
    private runtimeClient;
    private agentClient;
    private cloudwatchClient;
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
     * ── P0-2: Robust JSON extraction with 4-step repair pipeline ──
     *
     * Step 1: Attempt JSON.parse() on the raw content text
     * Step 2: If that fails, regex-extract JSON from markdown code fences
     * Step 3: If extraction fails, retry Bedrock with strict-JSON instruction
     * Step 4: If retry also fails, return the safe static fallback from P0-1
     *
     * Emits bedrock_json_repair_attempts metric on any repair attempt.
     */
    private extractTriageResponseWithRepair;
    /**
     * Retry Bedrock call with a strict-JSON-only instruction prepended.
     * Used as Step 3 of the JSON repair pipeline (P0-2).
     */
    private retryWithStrictJsonPrompt;
    /**
     * Complete triage pipeline: Retrieve + Generate
     *
     * Includes safety checks:
     * - P0-1: Zero-result RAG fallback (skip Claude if KB returns 0 docs)
     * - P0-4: Low-confidence escalation (override if confidenceScore < 0.6)
     */
    performTriage(request: TriageRequest): Promise<{
        response: TriageResponse;
        ragContext: RAGContext;
        processingTimeMs: number;
    }>;
    /**
     * Emit a custom CloudWatch metric to the ASHA-Triage namespace.
     * Used for safety monitoring: rag_zero_result_count,
     * bedrock_json_repair_attempts, low_confidence_triage_count.
     */
    private emitMetric;
}
/**
 * Export singleton instance
 */
export declare const bedrockService: BedrockService;
export default bedrockService;
//# sourceMappingURL=bedrock.service.d.ts.map