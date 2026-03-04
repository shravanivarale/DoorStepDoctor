/**
 * Token Counter Utility (P2-5)
 * 
 * Estimates the number of tokens in a given text string.
 * Used for enforcing token budgets before sending requests to Bedrock.
 */

export function estimateTokens(text: string): number {
    if (!text) return 0;
    // Rough estimation: 1 word ≈ 1.35 tokens
    return Math.ceil(text.split(/\s+/).length * 1.35);
}
