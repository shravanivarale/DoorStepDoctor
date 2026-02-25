/**
 * DynamoDB Service
 * 
 * Handles all database operations for the triage system including:
 * - Triage record storage
 * - User session management
 * - Emergency case logging
 * - Analytics data aggregation
 */

import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  BatchWriteItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import config from '../config/aws.config';
import logger from '../utils/logger';
import { DatabaseError } from '../utils/errors';
import {
  TriageResult,
  EmergencyEscalation,
  AnalyticsEvent
} from '../types/triage.types';

/**
 * DynamoDB Service Class
 */
export class DynamoDBService {
  private client: DynamoDBClient;
  
  constructor() {
    this.client = new DynamoDBClient({ region: config.region });
  }
  
  /**
   * Store triage result in DynamoDB
   * 
   * @param triageResult - Complete triage assessment result
   * @returns Stored triage ID
   */
  async storeTriageResult(triageResult: TriageResult): Promise<string> {
    try {
      const item = {
        triageId: triageResult.triageId,
        userId: triageResult.request.userId,
        timestamp: triageResult.request.timestamp,
        symptoms: triageResult.request.symptoms,
        language: triageResult.request.language,
        urgencyLevel: triageResult.response.urgencyLevel,
        riskScore: triageResult.response.riskScore,
        recommendedAction: triageResult.response.recommendedAction,
        referToPhc: triageResult.response.referToPhc,
        confidenceScore: triageResult.response.confidenceScore,
        citedGuideline: triageResult.response.citedGuideline,
        processingTimeMs: triageResult.metadata.processingTimeMs,
        bedrockTokensUsed: triageResult.metadata.bedrockTokensUsed,
        guardrailsTriggered: triageResult.metadata.guardrailsTriggered,
        location: triageResult.request.location,
        patientAge: triageResult.request.patientAge,
        patientGender: triageResult.request.patientGender,
        // TTL: 90 days for data retention
        ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)
      };
      
      const command = new PutItemCommand({
        TableName: config.dynamodb.triageTable,
        Item: marshall(item, { removeUndefinedValues: true })
      });
      
      await this.client.send(command);
      
      logger.info('Triage result stored', {
        triageId: triageResult.triageId,
        urgencyLevel: triageResult.response.urgencyLevel
      });
      
      return triageResult.triageId;
      
    } catch (error) {
      logger.error('Failed to store triage result', error as Error, {
        triageId: triageResult.triageId
      });
      throw new DatabaseError('store_triage', {
        triageId: triageResult.triageId,
        error: (error as Error).message
      });
    }
  }
  
  /**
   * Retrieve triage result by ID
   * 
   * @param triageId - Unique triage identifier
   * @returns Triage result or null if not found
   */
  async getTriageResult(triageId: string): Promise<TriageResult | null> {
    try {
      const command = new GetItemCommand({
        TableName: config.dynamodb.triageTable,
        Key: marshall({ triageId })
      });
      
      const response = await this.client.send(command);
      
      if (!response.Item) {
        return null;
      }
      
      const item = unmarshall(response.Item);
      
      // Reconstruct TriageResult from stored data
      return this.reconstructTriageResult(item);
      
    } catch (error) {
      logger.error('Failed to retrieve triage result', error as Error, { triageId });
      throw new DatabaseError('get_triage', {
        triageId,
        error: (error as Error).message
      });
    }
  }
  
  /**
   * Query triage history for a user
   * 
   * @param userId - User identifier
   * @param limit - Maximum number of results
   * @returns Array of triage results
   */
  async getUserTriageHistory(userId: string, limit: number = 10): Promise<TriageResult[]> {
    try {
      const command = new QueryCommand({
        TableName: config.dynamodb.triageTable,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: marshall({
          ':userId': userId
        }),
        ScanIndexForward: false, // Most recent first
        Limit: limit
      });
      
      const response = await this.client.send(command);
      
      if (!response.Items || response.Items.length === 0) {
        return [];
      }
      
      return response.Items.map(item => this.reconstructTriageResult(unmarshall(item)));
      
    } catch (error) {
      logger.error('Failed to retrieve user triage history', error as Error, { userId });
      throw new DatabaseError('query_user_history', {
        userId,
        error: (error as Error).message
      });
    }
  }
  
  /**
   * Store emergency escalation case
   * 
   * @param escalation - Emergency escalation details
   * @returns Emergency case ID
   */
  async storeEmergencyCase(escalation: EmergencyEscalation): Promise<string> {
    try {
      const item = {
        emergencyId: uuidv4(),
        triageId: escalation.triageId,
        urgencyLevel: escalation.urgencyLevel,
        patientInfo: escalation.patientInfo,
        location: escalation.location,
        nearestPhc: escalation.nearestPhc,
        referralNote: escalation.referralNote,
        timestamp: escalation.timestamp,
        notificationSent: escalation.notificationSent,
        status: 'pending',
        // TTL: 180 days for emergency records
        ttl: Math.floor(Date.now() / 1000) + (180 * 24 * 60 * 60)
      };
      
      const command = new PutItemCommand({
        TableName: config.dynamodb.emergencyTable,
        Item: marshall(item, { removeUndefinedValues: true })
      });
      
      await this.client.send(command);
      
      logger.logEmergencyEscalation(escalation.triageId, {
        emergencyId: item.emergencyId,
        location: escalation.location
      });
      
      return item.emergencyId;
      
    } catch (error) {
      logger.error('Failed to store emergency case', error as Error, {
        triageId: escalation.triageId
      });
      throw new DatabaseError('store_emergency', {
        triageId: escalation.triageId,
        error: (error as Error).message
      });
    }
  }
  
  /**
   * Store analytics event for district health intelligence
   * 
   * @param event - Analytics event data
   */
  async storeAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const item = {
        eventId: event.eventId,
        eventType: event.eventType,
        district: event.district,
        state: event.state,
        symptoms: event.symptoms,
        urgencyLevel: event.urgencyLevel,
        timestamp: event.timestamp,
        anonymized: event.anonymized,
        // Partition by date for efficient querying
        datePartition: event.timestamp.split('T')[0],
        // TTL: 365 days for analytics
        ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
      };
      
      const command = new PutItemCommand({
        TableName: config.dynamodb.analyticsTable,
        Item: marshall(item, { removeUndefinedValues: true })
      });
      
      await this.client.send(command);
      
      logger.debug('Analytics event stored', {
        eventId: event.eventId,
        eventType: event.eventType
      });
      
    } catch (error) {
      // Don't throw error for analytics failures - log and continue
      logger.warn('Failed to store analytics event', {
        eventId: event.eventId,
        error: (error as Error).message
      });
    }
  }
  
  /**
   * Batch store multiple analytics events
   * 
   * @param events - Array of analytics events
   */
  async batchStoreAnalyticsEvents(events: AnalyticsEvent[]): Promise<void> {
    try {
      const writeRequests = events.map(event => ({
        PutRequest: {
          Item: marshall({
            eventId: event.eventId,
            eventType: event.eventType,
            district: event.district,
            state: event.state,
            symptoms: event.symptoms,
            urgencyLevel: event.urgencyLevel,
            timestamp: event.timestamp,
            anonymized: event.anonymized,
            datePartition: event.timestamp.split('T')[0],
            ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
          }, { removeUndefinedValues: true })
        }
      }));
      
      // DynamoDB batch write limit is 25 items
      const batches = this.chunkArray(writeRequests, 25);
      
      for (const batch of batches) {
        const command = new BatchWriteItemCommand({
          RequestItems: {
            [config.dynamodb.analyticsTable]: batch
          }
        });
        
        await this.client.send(command);
      }
      
      logger.info('Batch analytics events stored', { count: events.length });
      
    } catch (error) {
      logger.warn('Failed to batch store analytics events', {
        count: events.length,
        error: (error as Error).message
      });
    }
  }
  
  /**
   * Query analytics events for district health intelligence
   * 
   * @param district - District name
   * @param startDate - Start date (ISO format)
   * @param endDate - End date (ISO format)
   * @returns Array of analytics events
   */
  async queryDistrictAnalytics(
    district: string,
    startDate: string,
    endDate: string
  ): Promise<AnalyticsEvent[]> {
    try {
      const command = new QueryCommand({
        TableName: config.dynamodb.analyticsTable,
        IndexName: 'DistrictDateIndex',
        KeyConditionExpression: 'district = :district AND datePartition BETWEEN :startDate AND :endDate',
        ExpressionAttributeValues: marshall({
          ':district': district,
          ':startDate': startDate.split('T')[0],
          ':endDate': endDate.split('T')[0]
        })
      });
      
      const response = await this.client.send(command);
      
      if (!response.Items || response.Items.length === 0) {
        return [];
      }
      
      return response.Items.map(item => unmarshall(item) as AnalyticsEvent);
      
    } catch (error) {
      logger.error('Failed to query district analytics', error as Error, {
        district,
        startDate,
        endDate
      });
      throw new DatabaseError('query_analytics', {
        district,
        error: (error as Error).message
      });
    }
  }
  
  /**
   * Update emergency case status
   * 
   * @param emergencyId - Emergency case identifier
   * @param status - New status
   */
  async updateEmergencyStatus(
    emergencyId: string,
    status: 'pending' | 'acknowledged' | 'resolved'
  ): Promise<void> {
    try {
      const command = new UpdateItemCommand({
        TableName: config.dynamodb.emergencyTable,
        Key: marshall({ emergencyId }),
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: marshall({
          ':status': status,
          ':updatedAt': new Date().toISOString()
        })
      });
      
      await this.client.send(command);
      
      logger.info('Emergency status updated', { emergencyId, status });
      
    } catch (error) {
      logger.error('Failed to update emergency status', error as Error, {
        emergencyId,
        status
      });
      throw new DatabaseError('update_emergency', {
        emergencyId,
        error: (error as Error).message
      });
    }
  }
  
  /**
   * Helper: Reconstruct TriageResult from DynamoDB item
   */
  private reconstructTriageResult(item: any): TriageResult {
    return {
      triageId: item.triageId,
      request: {
        userId: item.userId,
        symptoms: item.symptoms,
        language: item.language,
        timestamp: item.timestamp,
        patientAge: item.patientAge,
        patientGender: item.patientGender,
        location: item.location,
        voiceInput: false
      },
      response: {
        urgencyLevel: item.urgencyLevel,
        riskScore: item.riskScore,
        recommendedAction: item.recommendedAction,
        referToPhc: item.referToPhc,
        confidenceScore: item.confidenceScore,
        citedGuideline: item.citedGuideline
      },
      metadata: {
        processingTimeMs: item.processingTimeMs,
        bedrockTokensUsed: item.bedrockTokensUsed,
        guardrailsTriggered: item.guardrailsTriggered,
        retrievedDocuments: item.retrievedDocuments || 0,
        modelVersion: item.modelVersion || config.bedrock.modelId,
        timestamp: item.timestamp
      }
    };
  }
  
  /**
   * Helper: Chunk array into smaller batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * Export singleton instance
 */
export const dynamoDBService = new DynamoDBService();
export default dynamoDBService;