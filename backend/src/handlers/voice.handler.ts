/**
 * Voice Processing Lambda Handler
 * 
 * Handles voice-to-text transcription and text-to-speech synthesis
 * for multi-language support in the triage system.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import voiceService from '../services/voice.service';
import logger from '../utils/logger';
import { ValidationError, VoiceProcessingError } from '../utils/errors';
import { APIResponse, SupportedLanguage } from '../types/triage.types';

/**
 * Speech-to-text handler
 */
export async function speechToTextHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const requestId = context.awsRequestId;
  logger.setContext({ requestId, handler: 'speechToText' });
  
  try {
    if (!event.body) {
      throw new ValidationError('Request body is required');
    }
    
    const { audioS3Uri, language } = JSON.parse(event.body);
    
    if (!audioS3Uri) {
      throw new ValidationError('audioS3Uri is required');
    }
    
    logger.info('Speech-to-text request', { audioS3Uri, language });
    
    const result = await voiceService.speechToText(
      audioS3Uri,
      language as SupportedLanguage || 'hi-IN'
    );
    
    const response: APIResponse<typeof result> = {
      success: true,
      data: result,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: result.processingTimeMs
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
    logger.error('Speech-to-text failed', error as Error, { requestId });
    return handleVoiceError(error as Error, requestId);
  } finally {
    logger.clearContext();
  }
}

/**
 * Text-to-speech handler
 */
export async function textToSpeechHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const requestId = context.awsRequestId;
  logger.setContext({ requestId, handler: 'textToSpeech' });
  
  try {
    if (!event.body) {
      throw new ValidationError('Request body is required');
    }
    
    const { text, language } = JSON.parse(event.body);
    
    if (!text) {
      throw new ValidationError('text is required');
    }
    
    logger.info('Text-to-speech request', {
      textLength: text.length,
      language
    });
    
    const audioBuffer = await voiceService.textToSpeech(
      text,
      language as SupportedLanguage || 'hi-IN'
    );
    
    // Return audio as base64
    const audioBase64 = audioBuffer.toString('base64');
    
    const response: APIResponse<{ audio: string; format: string }> = {
      success: true,
      data: {
        audio: audioBase64,
        format: 'mp3'
      },
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
    logger.error('Text-to-speech failed', error as Error, { requestId });
    return handleVoiceError(error as Error, requestId);
  } finally {
    logger.clearContext();
  }
}

/**
 * Language detection handler
 */
export async function detectLanguageHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const requestId = context.awsRequestId;
  logger.setContext({ requestId, handler: 'detectLanguage' });
  
  try {
    if (!event.body) {
      throw new ValidationError('Request body is required');
    }
    
    const { audioS3Uri } = JSON.parse(event.body);
    
    if (!audioS3Uri) {
      throw new ValidationError('audioS3Uri is required');
    }
    
    logger.info('Language detection request', { audioS3Uri });
    
    const detectedLanguage = await voiceService.detectLanguage(audioS3Uri);
    
    const response: APIResponse<{ language: SupportedLanguage }> = {
      success: true,
      data: { language: detectedLanguage },
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
    logger.error('Language detection failed', error as Error, { requestId });
    return handleVoiceError(error as Error, requestId);
  } finally {
    logger.clearContext();
  }
}

/**
 * Handle voice processing errors
 */
function handleVoiceError(error: Error, requestId: string): APIGatewayProxyResult {
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let errorMessage = 'An unexpected error occurred';
  
  if (error instanceof ValidationError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = error.message;
  } else if (error instanceof VoiceProcessingError) {
    statusCode = 503;
    errorCode = 'VOICE_PROCESSING_ERROR';
    errorMessage = 'Voice service temporarily unavailable';
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
