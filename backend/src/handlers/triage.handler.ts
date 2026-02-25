/**
 * Triage Lambda Handler
 * 
 * Main API endpoint for processing triage requests from ASHA workers.
 * Orchestrates the complete triage pipeline: RAG retrieval + Claude inference + DynamoDB storage
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

import bedrockService from '../services/bedrock.service';
import dynamoDBService from '../services/dynamodb.service';
import logger from '../utils/logger';
import { ValidationError, BedrockError, DatabaseError } from '../utils/errors';
import {
  TriageRequestSchema,
  TriageResult,
  AnalyticsEvent,
  APIResponse
} from '../types/triage.types';

/**
 * Main triage handler
 * 
 * @param event - API Gateway event
 * @param context - Lambda context
 * @returns API Gateway response
 */
export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const startTime = Date.now();
  const requestId = context.awsRequestId;
  
  // Set logging context
  logger.setContext({ requestId, handler: 'triage' });
  
  try {
    logger.info('Triage request received', {
      path: event.path,
      method: event.httpMethod
    });
    
    // Parse and validate request body
    if (!event.body) {
      throw new ValidationError('Request body is required');
    }
    
    const requestBody = JSON.parse(event.body);
    const triageRequest = TriageRequestSchema.parse(requestBody);
    
    logger.info('Triage request validated', {
      userId: triageRequest.userId,
      language: triageRequest.language,
      voiceInput: triageRequest.voiceInput
    });
    
    // Perform triage using Bedrock RAG pipeline
    const { response, ragContext, processingTimeMs } = await bedrockService.performTriage(
      triageRequest
    );
    
    // Create triage result
    const triageResult: TriageResult = {
      triageId: uuidv4(),
      request: triageRequest,
      response,
      metadata: {
        processingTimeMs,
        bedrockTokensUsed: 0, // Will be populated from Bedrock response
        guardrailsTriggered: false,
        retrievedDocuments: ragContext.totalDocuments,
        modelVersion: 'anthropic.claude-3-haiku-20240307-v1:0',
        timestamp: new Date().toISOString()
      }
    };
    
    // Store triage result in DynamoDB
    await dynamoDBService.storeTriageResult(triageResult);
    
    // Store analytics event for district health intelligence
    const analyticsEvent: AnalyticsEvent = {
      eventId: uuidv4(),
      eventType: 'triage',
      district: triageRequest.location?.district || 'unknown',
      state: triageRequest.location?.state || 'unknown',
      symptoms: [triageRequest.symptoms],
      urgencyLevel: response.urgencyLevel,
      timestamp: new Date().toISOString(),
      anonymized: true
    };
    
    await dynamoDBService.storeAnalyticsEvent(analyticsEvent);
    
    // Handle emergency escalation if needed
    if (response.urgencyLevel === 'emergency') {
      logger.logEmergencyEscalation(triageResult.triageId, {
        riskScore: response.riskScore,
        location: triageRequest.location
      });
      
      // Emergency escalation will be handled by a separate service
      // For now, just log the event
    }
    
    const totalProcessingTime = Date.now() - startTime;
    
    logger.logPerformance('triage_complete', totalProcessingTime, {
      triageId: triageResult.triageId,
      urgencyLevel: response.urgencyLevel,
      riskScore: response.riskScore
    });
    
    // Build API response
    const apiResponse: APIResponse<TriageResult> = {
      success: true,
      data: triageResult,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: totalProcessingTime
      }
    };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(apiResponse)
    };
    
  } catch (error) {
    logger.error('Triage request failed', error as Error, { requestId });
    
    return handleError(error as Error, requestId);
  } finally {
    logger.clearContext();
  }
}

/**
 * Handle errors and return appropriate API response
 */
function handleError(error: Error, requestId: string): APIGatewayProxyResult {
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let errorMessage = 'An unexpected error occurred';
  
  if (error instanceof ValidationError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = error.message;
  } else if (error instanceof BedrockError) {
    statusCode = 503;
    errorCode = 'BEDROCK_ERROR';
    errorMessage = 'AI service temporarily unavailable';
  } else if (error instanceof DatabaseError) {
    statusCode = 503;
    errorCode = 'DATABASE_ERROR';
    errorMessage = 'Database service temporarily unavailable';
  }
  
  const apiResponse: APIResponse<never> = {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      requestId
    }
  };
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(apiResponse)
  };
}
