/**
 * Voice Processing Lambda Handler
 *
 * Handles voice-to-text transcription and text-to-speech synthesis
 * for multi-language support in the triage system.
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
/**
 * Speech-to-text handler
 */
export declare function speechToTextHandler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
/**
 * Text-to-speech handler
 */
export declare function textToSpeechHandler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
/**
 * Language detection handler
 */
export declare function detectLanguageHandler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
//# sourceMappingURL=voice.handler.d.ts.map