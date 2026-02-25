/**
 * DynamoDB Service
 *
 * Handles all database operations for the triage system including:
 * - Triage record storage
 * - User session management
 * - Emergency case logging
 * - Analytics data aggregation
 */
import { TriageResult, EmergencyEscalation, AnalyticsEvent } from '../types/triage.types';
/**
 * DynamoDB Service Class
 */
export declare class DynamoDBService {
    private client;
    constructor();
    /**
     * Store triage result in DynamoDB
     *
     * @param triageResult - Complete triage assessment result
     * @returns Stored triage ID
     */
    storeTriageResult(triageResult: TriageResult): Promise<string>;
    /**
     * Retrieve triage result by ID
     *
     * @param triageId - Unique triage identifier
     * @returns Triage result or null if not found
     */
    getTriageResult(triageId: string): Promise<TriageResult | null>;
    /**
     * Query triage history for a user
     *
     * @param userId - User identifier
     * @param limit - Maximum number of results
     * @returns Array of triage results
     */
    getUserTriageHistory(userId: string, limit?: number): Promise<TriageResult[]>;
    /**
     * Store emergency escalation case
     *
     * @param escalation - Emergency escalation details
     * @returns Emergency case ID
     */
    storeEmergencyCase(escalation: EmergencyEscalation): Promise<string>;
    /**
     * Store analytics event for district health intelligence
     *
     * @param event - Analytics event data
     */
    storeAnalyticsEvent(event: AnalyticsEvent): Promise<void>;
    /**
     * Batch store multiple analytics events
     *
     * @param events - Array of analytics events
     */
    batchStoreAnalyticsEvents(events: AnalyticsEvent[]): Promise<void>;
    /**
     * Query analytics events for district health intelligence
     *
     * @param district - District name
     * @param startDate - Start date (ISO format)
     * @param endDate - End date (ISO format)
     * @returns Array of analytics events
     */
    queryDistrictAnalytics(district: string, startDate: string, endDate: string): Promise<AnalyticsEvent[]>;
    /**
     * Update emergency case status
     *
     * @param emergencyId - Emergency case identifier
     * @param status - New status
     */
    updateEmergencyStatus(emergencyId: string, status: 'pending' | 'acknowledged' | 'resolved'): Promise<void>;
    /**
     * Helper: Reconstruct TriageResult from DynamoDB item
     */
    private reconstructTriageResult;
    /**
     * Helper: Chunk array into smaller batches
     */
    private chunkArray;
}
/**
 * Export singleton instance
 */
export declare const dynamoDBService: DynamoDBService;
export default dynamoDBService;
//# sourceMappingURL=dynamodb.service.d.ts.map