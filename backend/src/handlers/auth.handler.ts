/**
 * Authentication Lambda Handler
 * 
 * Handles user authentication, registration, and token validation
 * for ASHA workers and PHC doctors.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import authService from '../services/auth.service';
import logger from '../utils/logger';
import { ValidationError, AuthenticationError } from '../utils/errors';
import { APIResponse, UserSession } from '../types/triage.types';

/**
 * Login handler
 */
export async function loginHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const requestId = context.awsRequestId;
  logger.setContext({ requestId, handler: 'login' });
  
  try {
    if (!event.body) {
      throw new ValidationError('Request body is required');
    }
    
    const { username, password } = JSON.parse(event.body);
    
    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }
    
    logger.info('Login attempt', { username });
    
    const session = await authService.login({ username, password });
    
    const response: APIResponse<UserSession> = {
      success: true,
      data: session,
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
    logger.error('Login failed', error as Error, { requestId });
    return handleAuthError(error as Error, requestId);
  } finally {
    logger.clearContext();
  }
}

/**
 * Registration handler
 */
export async function registerHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const requestId = context.awsRequestId;
  logger.setContext({ requestId, handler: 'register' });
  
  try {
    if (!event.body) {
      throw new ValidationError('Request body is required');
    }
    
    const registrationData = JSON.parse(event.body);
    
    // Validate required fields
    const requiredFields = ['username', 'password', 'email', 'phoneNumber', 'role', 'district', 'state'];
    for (const field of requiredFields) {
      if (!registrationData[field]) {
        throw new ValidationError(`${field} is required`);
      }
    }
    
    logger.info('Registration attempt', {
      username: registrationData.username,
      role: registrationData.role
    });
    
    const userId = await authService.register(registrationData);
    
    const response: APIResponse<{ userId: string }> = {
      success: true,
      data: { userId },
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: 0
      }
    };
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    logger.error('Registration failed', error as Error, { requestId });
    return handleAuthError(error as Error, requestId);
  } finally {
    logger.clearContext();
  }
}

/**
 * Token validation handler
 */
export async function validateTokenHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const requestId = context.awsRequestId;
  logger.setContext({ requestId, handler: 'validateToken' });
  
  try {
    const token = authService.extractToken(event.headers.Authorization || event.headers.authorization);
    
    const session = await authService.validateToken(token);
    
    const response: APIResponse<UserSession> = {
      success: true,
      data: session,
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
    logger.error('Token validation failed', error as Error, { requestId });
    return handleAuthError(error as Error, requestId);
  } finally {
    logger.clearContext();
  }
}

/**
 * Confirm registration handler
 */
export async function confirmRegistrationHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const requestId = context.awsRequestId;
  logger.setContext({ requestId, handler: 'confirmRegistration' });
  
  try {
    if (!event.body) {
      throw new ValidationError('Request body is required');
    }
    
    const { username, code } = JSON.parse(event.body);
    
    if (!username || !code) {
      throw new ValidationError('Username and verification code are required');
    }
    
    await authService.confirmRegistration(username, code);
    
    const response: APIResponse<{ message: string }> = {
      success: true,
      data: { message: 'Registration confirmed successfully' },
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
    logger.error('Registration confirmation failed', error as Error, { requestId });
    return handleAuthError(error as Error, requestId);
  } finally {
    logger.clearContext();
  }
}

/**
 * Handle authentication errors
 */
function handleAuthError(error: Error, requestId: string): APIGatewayProxyResult {
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let errorMessage = 'An unexpected error occurred';
  
  if (error instanceof ValidationError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = error.message;
  } else if (error instanceof AuthenticationError) {
    statusCode = 401;
    errorCode = 'AUTHENTICATION_ERROR';
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
