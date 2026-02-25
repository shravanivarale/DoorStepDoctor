"use strict";
/**
 * Type Definitions for AI Triage Engine
 *
 * This module defines all TypeScript interfaces and types used throughout
 * the triage system, ensuring type safety and consistency.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriageResponseSchema = exports.TriageRequestSchema = void 0;
const zod_1 = require("zod");
/**
 * Triage Request Schema
 * Validates incoming triage requests from ASHA workers
 */
exports.TriageRequestSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    patientAge: zod_1.z.number().min(0).max(120).optional(),
    patientGender: zod_1.z.enum(['male', 'female', 'other']).optional(),
    symptoms: zod_1.z.string().min(10).max(1000),
    language: zod_1.z.enum(['hi-IN', 'mr-IN', 'ta-IN', 'te-IN', 'kn-IN', 'bn-IN', 'en-IN']),
    voiceInput: zod_1.z.boolean().default(false),
    location: zod_1.z.object({
        district: zod_1.z.string(),
        state: zod_1.z.string(),
        latitude: zod_1.z.number().optional(),
        longitude: zod_1.z.number().optional()
    }).optional(),
    timestamp: zod_1.z.string().datetime()
});
/**
 * Triage Response Schema
 * Structured JSON output from Claude 3 Haiku via Bedrock
 */
exports.TriageResponseSchema = zod_1.z.object({
    urgencyLevel: zod_1.z.enum(['low', 'medium', 'high', 'emergency']),
    riskScore: zod_1.z.number().min(0).max(1),
    recommendedAction: zod_1.z.string(),
    referToPhc: zod_1.z.boolean(),
    confidenceScore: zod_1.z.number().min(0).max(1),
    citedGuideline: zod_1.z.string(),
    reasoning: zod_1.z.string().optional(),
    redFlags: zod_1.z.array(zod_1.z.string()).optional()
});
//# sourceMappingURL=triage.types.js.map