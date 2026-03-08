/**
 * Voice Processing Service
 *
 * Handles voice-to-text (Amazon Transcribe) and text-to-voice (Amazon Polly)
 * for multi-language support in the triage system.
 */
import { SupportedLanguage, VoiceProcessingResult } from '../types/triage.types';
/**
 * Voice Service Class
 */
export declare class VoiceService {
    private transcribeStreamingClient;
    private pollyClient;
    private cwClient;
    constructor();
    /**
     * Convert speech to text using Amazon Transcribe
     *
     * @param audioS3Uri - S3 URI of audio file
     * @param language - Target language code
     * @returns Transcription result
     */
    speechToText(audioBuffer: Buffer, language?: SupportedLanguage): Promise<VoiceProcessingResult>;
    /**
     * Convert text to speech using Amazon Polly
     *
     * @param text - Text to synthesize
     * @param language - Target language code
     * @returns Audio stream
     */
    textToSpeech(text: string, language?: SupportedLanguage): Promise<Buffer>;
    /**
     * Helper: Convert readable stream to buffer
     */
    private streamToBuffer;
}
/**
 * Export singleton instance
 */
export declare const voiceService: VoiceService;
export default voiceService;
//# sourceMappingURL=voice.service.d.ts.map