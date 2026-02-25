/**
 * Emergency Escalation Service
 * 
 * Handles emergency case detection, PHC notification, and referral generation
 * for high-risk triage cases.
 */

import dynamoDBService from './dynamodb.service';
import config from '../config/aws.config';
import logger from '../utils/logger';
import {
  TriageResult,
  EmergencyEscalation
} from '../types/triage.types';

/**
 * PHC (Primary Health Center) information
 */
interface PHCInfo {
  name: string;
  district: string;
  state: string;
  contact: string;
  latitude: number;
  longitude: number;
}

/**
 * Emergency Service Class
 */
export class EmergencyService {
  
  /**
   * Check if triage result requires emergency escalation
   * 
   * @param triageResult - Triage assessment result
   * @returns True if emergency escalation needed
   */
  shouldEscalate(triageResult: TriageResult): boolean {
    const { response } = triageResult;
    
    // Emergency level always escalates
    if (response.urgencyLevel === 'emergency') {
      return true;
    }
    
    // High risk score triggers escalation
    if (response.riskScore >= config.emergency.autoEscalationThreshold) {
      return true;
    }
    
    // Explicit PHC referral recommendation
    if (response.referToPhc && response.urgencyLevel === 'high') {
      return true;
    }
    
    return false;
  }
  
  /**
   * Process emergency escalation
   * 
   * @param triageResult - Triage assessment result
   * @returns Emergency escalation record
   */
  async processEmergency(triageResult: TriageResult): Promise<EmergencyEscalation> {
    try {
      logger.info('Processing emergency escalation', {
        triageId: triageResult.triageId,
        urgencyLevel: triageResult.response.urgencyLevel,
        riskScore: triageResult.response.riskScore
      });
      
      // Find nearest PHC
      const nearestPhc = await this.findNearestPHC(
        triageResult.request.location?.district || 'unknown',
        triageResult.request.location?.state || 'unknown',
        triageResult.request.location?.latitude,
        triageResult.request.location?.longitude
      );
      
      // Generate referral note
      const referralNote = this.generateReferralNote(triageResult);
      
      // Create emergency escalation record
      const escalation: EmergencyEscalation = {
        triageId: triageResult.triageId,
        urgencyLevel: 'emergency',
        patientInfo: {
          age: triageResult.request.patientAge,
          gender: triageResult.request.patientGender,
          symptoms: triageResult.request.symptoms
        },
        location: {
          district: triageResult.request.location?.district || 'unknown',
          state: triageResult.request.location?.state || 'unknown',
          coordinates: triageResult.request.location?.latitude && triageResult.request.location?.longitude
            ? {
                latitude: triageResult.request.location.latitude,
                longitude: triageResult.request.location.longitude
              }
            : undefined
        },
        nearestPhc,
        referralNote,
        timestamp: new Date().toISOString(),
        notificationSent: false
      };
      
      // Store emergency case in DynamoDB
      const emergencyId = await dynamoDBService.storeEmergencyCase(escalation);
      
      // Send notification to PHC (if enabled)
      if (config.emergency.phcNotificationEnabled) {
        await this.notifyPHC(escalation, emergencyId);
      }
      
      logger.logEmergencyEscalation(triageResult.triageId, {
        emergencyId,
        nearestPhc: nearestPhc.name,
        notificationSent: config.emergency.phcNotificationEnabled
      });
      
      return escalation;
      
    } catch (error) {
      logger.error('Emergency escalation failed', error as Error, {
        triageId: triageResult.triageId
      });
      throw error;
    }
  }
  
  /**
   * Find nearest Primary Health Center
   * 
   * @param district - Patient district
   * @param state - Patient state
   * @param latitude - Patient latitude (optional)
   * @param longitude - Patient longitude (optional)
   * @returns Nearest PHC information
   */
  private async findNearestPHC(
    district: string,
    state: string,
    latitude?: number,
    longitude?: number
  ): Promise<{ name: string; distance: number; contact: string }> {
    // In production, query PHC database or use geospatial search
    // For now, return mock data
    
    logger.debug('Finding nearest PHC', { district, state, latitude, longitude });
    
    // Mock PHC data
    const mockPHCs: PHCInfo[] = [
      {
        name: 'District Primary Health Center',
        district,
        state,
        contact: config.emergency.emergencyContactNumber,
        latitude: latitude || 0,
        longitude: longitude || 0
      }
    ];
    
    // Calculate distance if coordinates provided
    const distance = latitude && longitude ? this.calculateDistance(
      latitude,
      longitude,
      mockPHCs[0].latitude,
      mockPHCs[0].longitude
    ) : 5.0;
    
    return {
      name: mockPHCs[0].name,
      distance,
      contact: mockPHCs[0].contact
    };
  }
  
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Generate referral note for PHC doctor
   */
  private generateReferralNote(triageResult: TriageResult): string {
    const { request, response } = triageResult;
    
    const note = `
EMERGENCY REFERRAL NOTE
Generated: ${new Date().toISOString()}

PATIENT INFORMATION:
- Age: ${request.patientAge || 'Not provided'}
- Gender: ${request.patientGender || 'Not provided'}
- Location: ${request.location?.district || 'Unknown'}, ${request.location?.state || 'Unknown'}

PRESENTING SYMPTOMS:
${request.symptoms}

TRIAGE ASSESSMENT:
- Urgency Level: ${response.urgencyLevel.toUpperCase()}
- Risk Score: ${(response.riskScore * 100).toFixed(0)}%
- Confidence: ${(response.confidenceScore * 100).toFixed(0)}%

RECOMMENDED ACTION:
${response.recommendedAction}

RED FLAGS:
${response.redFlags?.join('\n') || 'None identified'}

CLINICAL GUIDELINE REFERENCE:
${response.citedGuideline}

REASONING:
${response.reasoning || 'See assessment above'}

---
This is an AI-generated triage assessment. Please conduct a thorough clinical evaluation.
ASHA Worker ID: ${request.userId}
Triage ID: ${triageResult.triageId}
`;
    
    return note.trim();
  }
  
  /**
   * Send notification to PHC dashboard
   * In production, this would use SNS, SQS, or WebSocket
   */
  private async notifyPHC(
    escalation: EmergencyEscalation,
    emergencyId: string
  ): Promise<void> {
    try {
      logger.info('Sending PHC notification', {
        emergencyId,
        phc: escalation.nearestPhc.name
      });
      
      // In production:
      // - Send SNS notification
      // - Push to SQS queue for PHC dashboard
      // - Send SMS to on-call doctor
      // - Update WebSocket connections
      
      // For now, just log
      logger.info('PHC notification sent', {
        emergencyId,
        phc: escalation.nearestPhc.name,
        contact: escalation.nearestPhc.contact
      });
      
    } catch (error) {
      logger.error('PHC notification failed', error as Error, {
        emergencyId
      });
      // Don't throw - notification failure shouldn't block escalation
    }
  }
  
  /**
   * Get emergency contact information
   */
  getEmergencyContact(): string {
    return config.emergency.emergencyContactNumber;
  }
  
  /**
   * Check if symptoms contain emergency keywords
   */
  containsEmergencyKeywords(symptoms: string): boolean {
    const emergencyKeywords = [
      'chest pain',
      'difficulty breathing',
      'unconscious',
      'severe bleeding',
      'stroke',
      'heart attack',
      'seizure',
      'poisoning',
      'severe burn',
      'head injury',
      'suicide',
      'overdose'
    ];
    
    const lowerSymptoms = symptoms.toLowerCase();
    return emergencyKeywords.some(keyword => lowerSymptoms.includes(keyword));
  }
}

/**
 * Export singleton instance
 */
export const emergencyService = new EmergencyService();
export default emergencyService;
