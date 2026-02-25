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
    private transcribeClient;
    private pollyClient;
    constructor();
    /**
     * Convert speech to text using Amazon Transcribe
     *
     * @param audioS3Uri - S3 URI of audio file
     * @param language - Target language code
     * @returns Transcription result
     */
    speechToText(audioS3Uri: string, language?: SupportedLanguage): Promise<VoiceProcessingResult>;
    /**
     * Poll transcription job until complete
     */
    private pollTranscriptionJob;
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
    /**
     * Detect language from audio (simplified version)
     * In production, use Transcribe's automatic language detection
     */
    detectLanguage(audioS3Uri: string): Promise<SupportedLanguage>;
}
/**
 * Export singleton instance
 */
export declare const voiceService: VoiceService;
export default voiceService;
//# sourceMappingURL=voice.service.d.ts.map