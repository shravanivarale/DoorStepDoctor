/**
 * Emergency Escalation Service
 *
 * Handles emergency case detection, PHC notification, and referral generation
 * for high-risk triage cases.
 */
import { TriageResult, EmergencyEscalation } from '../types/triage.types';
/**
 * Emergency Service Class
 */
export declare class EmergencyService {
    /**
     * Check if triage result requires emergency escalation
     *
     * @param triageResult - Triage assessment result
     * @returns True if emergency escalation needed
     */
    shouldEscalate(triageResult: TriageResult): boolean;
    /**
     * Process emergency escalation
     *
     * @param triageResult - Triage assessment result
     * @returns Emergency escalation record
     */
    processEmergency(triageResult: TriageResult): Promise<EmergencyEscalation>;
    /**
     * Find nearest Primary Health Center
     *
     * @param district - Patient district
     * @param state - Patient state
     * @param latitude - Patient latitude (optional)
     * @param longitude - Patient longitude (optional)
     * @returns Nearest PHC information
     */
    private findNearestPHC;
    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    private calculateDistance;
    private toRadians;
    /**
     * Generate referral note for PHC doctor
     */
    private generateReferralNote;
    /**
     * Send notification to PHC dashboard
     * In production, this would use SNS, SQS, or WebSocket
     */
    private notifyPHC;
    /**
     * Get emergency contact information
     */
    getEmergencyContact(): string;
    /**
     * Check if symptoms contain emergency keywords
     */
    containsEmergencyKeywords(symptoms: string): boolean;
}
/**
 * Export singleton instance
 */
export declare const emergencyService: EmergencyService;
export default emergencyService;
//# sourceMappingURL=emergency.service.d.ts.map