/**
 * TypeScript Type Definitions for Frontend
 */

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';
export type UserRole = 'asha_worker' | 'phc_doctor' | 'admin';
export type SupportedLanguage = 'hi-IN' | 'mr-IN' | 'ta-IN' | 'te-IN' | 'kn-IN' | 'bn-IN' | 'en-IN';

export interface TriageRequest {
  userId: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  symptoms: string;
  language: SupportedLanguage;
  voiceInput?: boolean;
  location?: {
    district: string;
    state: string;
    latitude?: number;
    longitude?: number;
  };
  timestamp: string;
}

export interface TriageResponse {
  urgencyLevel: UrgencyLevel;
  riskScore: number;
  recommendedAction: string;
  referToPhc: boolean;
  confidenceScore: number;
  citedGuideline: string;
  reasoning?: string;
  redFlags?: string[];
}

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

export interface EmergencyCase {
  emergencyId: string;
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
  };
  nearestPhc: {
    name: string;
    distance: number;
    contact: string;
  };
  referralNote: string;
  timestamp: string;
  status: 'pending' | 'acknowledged' | 'resolved';
}
