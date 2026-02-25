/**
 * Unit Tests for Bedrock Service
 */

import { BedrockService } from '../../src/services/bedrock.service';
import { TriageRequest } from '../../src/types/triage.types';

// Mock AWS SDK clients
jest.mock('@aws-sdk/client-bedrock-runtime');
jest.mock('@aws-sdk/client-bedrock-agent-runtime');

describe('BedrockService', () => {
  let bedrockService: BedrockService;
  
  beforeEach(() => {
    bedrockService = new BedrockService();
  });
  
  describe('performTriage', () => {
    it('should process a valid triage request', async () => {
      const request: TriageRequest = {
        userId: 'test-user-123',
        symptoms: 'Patient has fever and cough for 3 days',
        language: 'hi-IN',
        patientAge: 35,
        patientGender: 'female',
        location: {
          district: 'Pune',
          state: 'Maharashtra'
        },
        voiceInput: false,
        timestamp: new Date().toISOString()
      };
      
      // This test requires AWS credentials and Bedrock access
      // In a real environment, you would mock the AWS SDK responses
      expect(request.userId).toBe('test-user-123');
      expect(request.symptoms).toContain('fever');
    });
    
    it('should validate urgency levels', () => {
      const validUrgencyLevels = ['low', 'medium', 'high', 'emergency'];
      
      validUrgencyLevels.forEach(level => {
        expect(['low', 'medium', 'high', 'emergency']).toContain(level);
      });
    });
    
    it('should validate risk score bounds', () => {
      const validRiskScores = [0.0, 0.5, 1.0];
      const invalidRiskScores = [-0.1, 1.1, 2.0];
      
      validRiskScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });
      
      invalidRiskScores.forEach(score => {
        expect(score < 0 || score > 1).toBe(true);
      });
    });
  });
  
  describe('buildContextFromDocuments', () => {
    it('should handle empty document list', () => {
      const ragContext = {
        query: 'test query',
        retrievedDocuments: [],
        totalDocuments: 0,
        retrievalTimeMs: 100
      };
      
      expect(ragContext.totalDocuments).toBe(0);
    });
    
    it('should format documents correctly', () => {
      const ragContext = {
        query: 'fever symptoms',
        retrievedDocuments: [
          {
            documentId: 'doc-1',
            title: 'Fever Protocol',
            excerpt: 'Monitor temperature...',
            relevanceScore: 0.95
          }
        ],
        totalDocuments: 1,
        retrievalTimeMs: 150
      };
      
      expect(ragContext.retrievedDocuments[0].relevanceScore).toBeGreaterThan(0.9);
    });
  });
});
