/**
 * Emergency Escalation Lambda Handler
 * 
 * Handles emergency case management, PHC notifications,
 * and emergency queue queries for PHC dashboard.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import emergencyService from '../services/emergency.service';
import dynamoDBService from '../services/dynamodb.service';
import logger from '../utils/logger';
import { ValidationError } from '../utils/errors';
import { APIResponse } from '../types/triage.types';

/**
 * Get emergency cases for PHC dashboard
 */
export async function getEmergencyCasesHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const requestId = context.awsRequestId;
  logger.setContext({ requestId, handler: 'getEmergencyCases' });
  
  try {
    const district = event.queryStringParameters?.district;
    const status = event.queryStringParameters?.status || 'pending';
    
    if (!district) {
      throw new ValidationError('district query parameter is required');
    }
    
    logger.info('Fetching emergency cases', { district, status });
    
    // In production, query DynamoDB for emergency cases by district
    // For now, return mock data
    const emergencyCases: any[] = [];
    
    const response: APIResponse<any[]> = {
      success: true,
      data: emergencyCases,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: 0
      }
    };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    logger.error('Failed to fetch emergency cases', error as Error, { requestId });
    return handleEmergencyError(error as Error, requestId);
  } finally {
    logger.clearContext();
  }
}

/**
 * Update emergency case status
 */
export async function updateEmergencyStatusHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const requestId = context.awsRequestId;
  logger.setContext({ requestId, handler: 'updateEmergencyStatus' });
  
  try {
    if (!event.body) {
      throw new ValidationError('Request body is required');
    }
    
    const { emergencyId, status } = JSON.parse(event.body);
    
    if (!emergencyId || !status) {
      throw new ValidationError('emergencyId and status are required');
    }
    
    if (!['pending', 'acknowledged', 'resolved'].includes(status)) {
      throw new ValidationError('Invalid status value');
    }
    
    logger.info('Updating emergency status', { emergencyId, status });
    
    await dynamoDBService.updateEmergencyStatus(emergencyId, status);
    
    const response: APIResponse<{ message: string }> = {
      success: true,
      data: { message: 'Emergency status updated successfully' },
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: 0
      }
    };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    logger.error('Failed to update emergency status', error as Error, { requestId });
    return handleEmergencyError(error as Error, requestId);
  } finally {
    logger.clearContext();
  }
}

/**
 * Get emergency contact information
 */
export async function getEmergencyContactHandler(
  _event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const requestId = context.awsRequestId;
  logger.setContext({ requestId, handler: 'getEmergencyContact' });
  
  try {
    const emergencyContact = emergencyService.getEmergencyContact();
    
    const response: APIResponse<{ contact: string }> = {
      success: true,
      data: { contact: emergencyContact },
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: 0
      }
    };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    logger.error('Failed to get emergency contact', error as Error, { requestId });
    return handleEmergencyError(error as Error, requestId);
  } finally {
    logger.clearContext();
  }
}

/**
 * Handle emergency errors
 */
function handleEmergencyError(error: Error, requestId: string): APIGatewayProxyResult {
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let errorMessage = 'An unexpected error occurred';
  
  if (error instanceof ValidationError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = error.message;
  }
  
  const response: APIResponse<never> = {
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
    body: JSON.stringify(response)
  };
}
