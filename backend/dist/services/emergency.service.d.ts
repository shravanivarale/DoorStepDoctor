/**
 * Emergency Escalation Service
 *
 * Handles emergency case detection, PHC notification, and referral generation
 * for high-risk triage cases.
 *
 * ── P0-3: Composite Risk Scoring ──
 * riskScore is a COMPOSITE of two sources:
 *   primaryScore  — extracted from Claude's JSON output (0.0–1.0)
 *   keywordBoost  — +0.3 if ANY emergency keyword appears in symptom text
 *   finalScore    = clamp(primaryScore + keywordBoost, 0.0, 1.0)
 * If keywordBoost was applied, urgencyLevel is overridden to "critical"
 * regardless of Claude's output. The keyword check is the safety net.
 *
 * ── P0-5: Notification with Delivery Confirmation ──
 * On emergency creation: notificationStatus = "pending_ack", notifiedAt = now
 * Real SNS publish for PHC notification.
 *
 * ── P0-6: Nearest PHC from DynamoDB ──
 * Queries asha-phc-directory by district GSI, calculates Haversine distance,
 * returns closest PHC. Falls back to { name: "District PHC Helpline", ... }.
 */
import { TriageResult, TriageResponse, EmergencyEscalation } from '../types/triage.types';
/**
 * Emergency Service Class
 */
export declare class EmergencyService {
    private dynamoClient;
    private snsClient;
    private cloudwatchClient;
    constructor();
    /**
     * ── P0-3: Composite Risk Score Calculation ──
     *
     * SCORING FORMULA:
     *   primaryScore  = riskScore from Claude's JSON output (0.0–1.0)
     *   keywordBoost  = +0.3 if ANY emergency keyword is found in symptoms
     *   finalScore    = Math.min(1.0, Math.max(0.0, primaryScore + keywordBoost))
     *
     * If keywordBoost was applied:
     *   - urgencyLevel is overridden to "critical"
     *   - This is a SAFETY OVERRIDE, not a suggestion
     *
     * Both primaryScore and finalScore are logged to CloudWatch for drift monitoring.
     *
     * @param response - The triage response from Claude (will be mutated)
     * @param symptoms - Raw symptom string from the ASHA worker
     * @returns The mutated response with composite score applied
     */
    applyCompositeRiskScore(response: TriageResponse, symptoms: string): TriageResponse;
    /**
     * Check if symptoms contain any emergency keywords (P0-3)
     */
    private checkEmergencyKeywords;
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
     * ── P0-5: Sets notificationStatus = "pending_ack" and notifiedAt timestamp ──
     * ── P0-6: Queries real PHC directory instead of mock data ──
     *
     * @param triageResult - Triage assessment result
     * @returns Emergency escalation record
     */
    processEmergency(triageResult: TriageResult): Promise<EmergencyEscalation>;
    /**
     * ── P0-6: Find nearest PHC from DynamoDB asha-phc-directory table ──
     *
     * Queries the asha-phc-directory table by district using the district-state-index GSI.
     * Calculates straight-line distance using Haversine formula for each result.
     * Returns the record with the shortest distance.
     *
     * If no PHC found for district, returns safe fallback:
     *   { name: "District PHC Helpline", phoneNumber: "104", distance: null }
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
     * Returns distance in kilometers
     */
    private calculateDistance;
    private toRadians;
    /**
     * Generate referral note for PHC doctor
     */
    private generateReferralNote;
    /**
     * ── P0-5: Send SNS notification to PHC ──
     * Publishes emergency alert via SNS topic for PHC dashboard consumption.
     */
    private notifyPHC;
    /**
     * Get emergency contact information
     */
    getEmergencyContact(): string;
    /**
     * Check if symptoms contain emergency keywords (public API)
     * Used by triage handler for quick pre-screening.
     */
    containsEmergencyKeywords(symptoms: string): boolean;
    /**
     * Emit primaryScore and finalScore to CloudWatch for drift monitoring (P0-3)
     */
    private emitRiskScoreMetrics;
}
/**
 * Export singleton instance
 */
export declare const emergencyService: EmergencyService;
export default emergencyService;
//# sourceMappingURL=emergency.service.d.ts.map