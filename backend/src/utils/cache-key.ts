/**
 * Semantic Cache Key Generator (P2-6)
 * 
 * Generates deterministic cache keys based on patient parameters.
 * Helps reduce Bedrock latency and cost for common, non-critical symptom queries.
 */
import crypto from 'crypto';

export function normaliseSymptoms(symptoms: string): string {
    return symptoms
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter(Boolean)
        .sort()
        .join(' ');
}

export function ageBucket(age: number): string {
    if (age < 2) return 'infant';
    if (age < 12) return 'child';
    if (age < 18) return 'teen';
    if (age < 60) return 'adult';
    return 'senior';
}

export function buildCacheKey(symptoms: string, age: number, gender: string): string {
    const normSymptoms = normaliseSymptoms(symptoms);
    const bucket = ageBucket(age);
    const rawKey = `${normSymptoms}|${bucket}|${gender.toLowerCase()}`;
    return crypto.createHash('sha256').update(rawKey).digest('hex');
}
