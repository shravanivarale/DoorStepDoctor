/**
 * Type Definitions for AI Triage Engine
 * 
 * This module defines all TypeScript interfaces and types used throughout
 * the triage system, ensuring type safety and consistency.
 */

import { z } from 'zod';

/**
 * Urgency levels for patient triage
 * - low: Non-urgent, can wait for regular appointment
 * - medium: Should be seen within 24-48 hours
 * - high: Should be seen within hours
 * - emergency: Immediate medical attention required
 */
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

/**
 * User roles in the system
 */
export type UserRole = 'asha_worker' | 'phc_doctor' | 'admin';

/**
 * Supported Indian languages for voice interface
 */
export type SupportedLanguage = 'hi-IN' | 'mr-IN' | 'ta-IN' | 'te-IN' | 'kn-IN' | 'bn-IN' | 'en-IN';

/**
 * Triage Request Schema
 * Validates incoming triage requests from ASHA workers
 */
export const TriageRequestSchema = z.object({
  userId: z.string().uuid(),
  patientAge: z.number().min(0).max(120).optional(),
  patientGender: z.enum(['male', 'female', 'other']).optional(),
  symptoms: z.string().min(10).max(1000),
  language: z.enum(['hi-IN', 'mr-IN', 'ta-IN', 'te-IN', 'kn-IN', 'bn-IN', 'en-IN']),
  voiceInput: z.boolean().default(false),
  location: z.object({
    district: z.string(),
    state: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional(),
  timestamp: z.string().datetime()
});

export type TriageRequest = z.infer<typeof TriageRequestSchema>;

/**
 * Triage Response Schema
 * Structured JSON output from Claude 3 Haiku via Bedrock
 */
export const TriageResponseSchema = z.object({
  urgencyLevel: z.enum(['low', 'medium', 'high', 'emergency']),
  riskScore: z.number().min(0).max(1),
  recommendedAction: z.string(),
  referToPhc: z.boolean(),
  confidenceScore: z.number().min(0).max(1),
  citedGuideline: z.string(),
  reasoning: z.string().optional(),
  redFlags: z.array(z.string()).optional()
});

export type TriageResponse = z.infer<typeof TriageResponseSchema>;

/**
 * Complete Triage Result
 * Includes request, response, and metadata
 */
export interface TriageResult {
  triageId: string;
  request: TriageRequest;
  response: TriageResponse;
  metadata: {
    processingTimeMs: number;
    bedrockTokensUsed: number;
    guardrailsTriggered: boolean;
    retrievedDocuments: number;
    modelVersion: string;
    timestamp: string;
  };
}

/**
 * Knowledge Base Document
 * Structure for medical protocol documents
 */
export interface KnowledgeDocument {
  documentId: string;
  title: string;
  content: string;
  category: 'triage' | 'maternal' | 'pediatric' | 'seasonal' | 'emergency';
  source: string;
  version: string;
  lastUpdated: string;
  metadata: Record<string, unknown>;
}

/**
 * Emergency Escalation
 * Structure for emergency case handling
 */
export interface EmergencyEscalation {
  triageId: string;
  urgencyLevel: 'emergency';
  patientInfo: {
    age?: number;
    gender?: string;
    symptoms: string;
  };
  location: {
    district: string;
    state: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  nearestPhc: {
    name: string;
    distance: number;
    contact: string;
  };
  referralNote: string;
  timestamp: string;
  notificationSent: boolean;
}

/**
 * User Session
 * Cognito user session information
 */
export interface UserSession {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  phoneNumber?: string;
  assignedPhc?: string;
  district: string;
  state: string;
  sessionToken: string;
  expiresAt: string;
}

/**
 * Analytics Event
 * Structure for district health intelligence
 */
export interface AnalyticsEvent {
  eventId: string;
  eventType: 'triage' | 'emergency' | 'referral';
  district: string;
  state: string;
  symptoms: string[];
  urgencyLevel: UrgencyLevel;
  timestamp: string;
  anonymized: boolean;
}

/**
 * Bedrock RAG Context
 * Retrieved context from Knowledge Base
 */
export interface RAGContext {
  query: string;
  retrievedDocuments: Array<{
    documentId: string;
    title: string;
    excerpt: string;
    relevanceScore: number;
  }>;
  totalDocuments: number;
  retrievalTimeMs: number;
}

/**
 * Guardrail Event
 * Logged when Bedrock Guardrails are triggered
 */
export interface GuardrailEvent {
  triageId: string;
  triggerType: 'medication' | 'diagnosis' | 'harmful_content' | 'template_violation';
  originalOutput: string;
  sanitizedOutput: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Voice Processing Result
 * Output from Amazon Transcribe
 */
export interface VoiceProcessingResult {
  transcription: string;
  confidence: number;
  detectedLanguage: SupportedLanguage;
  processingTimeMs: number;
  audioLengthSeconds: number;
}

/**
 * SMS Triage Request
 * Structured SMS input format
 */
export interface SMSTriageRequest {
  phoneNumber: string;
  message: string;
  parsedSymptoms: string;
  timestamp: string;
}

/**
 * Cost Tracking
 * Per-triage cost breakdown
 */
export interface CostTracking {
  triageId: string;
  bedrockCost: number;
  transcribeCost: number;
  pollyCost: number;
  dynamoDbCost: number;
  totalCost: number;
  currency: 'INR' | 'USD';
  timestamp: string;
}

/**
 * Error Response
 * Standardized error structure
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId: string;
  };
}

/**
 * API Response Wrapper
 * Generic API response structure
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse['error'];
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTimeMs: number;
  };
}