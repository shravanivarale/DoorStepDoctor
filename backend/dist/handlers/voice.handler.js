"use strict";
/**
 * Voice Processing Lambda Handler
 *
 * Handles voice-to-text transcription and text-to-speech synthesis
 * for multi-language support in the triage system.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.speechToTextHandler = speechToTextHandler;
exports.textToSpeechHandler = textToSpeechHandler;
exports.detectLanguageHandler = detectLanguageHandler;
const voice_service_1 = __importDefault(require("../services/voice.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
/**
 * Speech-to-text handler
 */
async function speechToTextHandler(event, context) {
    const requestId = context.awsRequestId;
    logger_1.default.setContext({ requestId, handler: 'speechToText' });
    try {
        if (!event.body) {
            throw new errors_1.ValidationError('Request body is required');
        }
        const { audioS3Uri, language } = JSON.parse(event.body);
        if (!audioS3Uri) {
            throw new errors_1.ValidationError('audioS3Uri is required');
        }
        logger_1.default.info('Speech-to-text request', { audioS3Uri, language });
        const result = await voice_service_1.default.speechToText(audioS3Uri, language || 'hi-IN');
        const response = {
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
    }
    catch (error) {
        logger_1.default.error('Speech-to-text failed', error, { requestId });
        return handleVoiceError(error, requestId);
    }
    finally {
        logger_1.default.clearContext();
    }
}
/**
 * Text-to-speech handler
 */
async function textToSpeechHandler(event, context) {
    const requestId = context.awsRequestId;
    logger_1.default.setContext({ requestId, handler: 'textToSpeech' });
    try {
        if (!event.body) {
            throw new errors_1.ValidationError('Request body is required');
        }
        const { text, language } = JSON.parse(event.body);
        if (!text) {
            throw new errors_1.ValidationError('text is required');
        }
        logger_1.default.info('Text-to-speech request', {
            textLength: text.length,
            language
        });
        const audioBuffer = await voice_service_1.default.textToSpeech(text, language || 'hi-IN');
        // Return audio as base64
        const audioBase64 = audioBuffer.toString('base64');
        const response = {
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
    }
    catch (error) {
        logger_1.default.error('Text-to-speech failed', error, { requestId });
        return handleVoiceError(error, requestId);
    }
    finally {
        logger_1.default.clearContext();
    }
}
/**
 * Language detection handler
 */
async function detectLanguageHandler(event, context) {
    const requestId = context.awsRequestId;
    logger_1.default.setContext({ requestId, handler: 'detectLanguage' });
    try {
        if (!event.body) {
            throw new errors_1.ValidationError('Request body is required');
        }
        const { audioS3Uri } = JSON.parse(event.body);
        if (!audioS3Uri) {
            throw new errors_1.ValidationError('audioS3Uri is required');
        }
        logger_1.default.info('Language detection request', { audioS3Uri });
        const detectedLanguage = await voice_service_1.default.detectLanguage(audioS3Uri);
        const response = {
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
    }
    catch (error) {
        logger_1.default.error('Language detection failed', error, { requestId });
        return handleVoiceError(error, requestId);
    }
    finally {
        logger_1.default.clearContext();
    }
}
/**
 * Handle voice processing errors
 */
function handleVoiceError(error, requestId) {
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof errors_1.ValidationError) {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        errorMessage = error.message;
    }
    else if (error instanceof errors_1.VoiceProcessingError) {
        statusCode = 503;
        errorCode = 'VOICE_PROCESSING_ERROR';
        errorMessage = 'Voice service temporarily unavailable';
    }
    const response = {
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
//# sourceMappingURL=voice.handler.js.map