"use strict";
/**
 * Voice Processing Service
 *
 * Handles voice-to-text (Amazon Transcribe) and text-to-voice (Amazon Polly)
 * for multi-language support in the triage system.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceService = exports.VoiceService = void 0;
const client_transcribe_1 = require("@aws-sdk/client-transcribe");
const client_polly_1 = require("@aws-sdk/client-polly");
const aws_config_1 = __importStar(require("../config/aws.config"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
/**
 * Voice Service Class
 */
class VoiceService {
    constructor() {
        this.transcribeClient = new client_transcribe_1.TranscribeClient({ region: aws_config_1.default.region });
        this.pollyClient = new client_polly_1.PollyClient({ region: aws_config_1.default.region });
    }
    /**
     * Convert speech to text using Amazon Transcribe
     *
     * @param audioS3Uri - S3 URI of audio file
     * @param language - Target language code
     * @returns Transcription result
     */
    async speechToText(audioS3Uri, language = 'hi-IN') {
        const startTime = Date.now();
        const jobName = `triage-${Date.now()}`;
        try {
            logger_1.default.debug('Starting transcription job', { audioS3Uri, language });
            // Start transcription job
            const startCommand = new client_transcribe_1.StartTranscriptionJobCommand({
                TranscriptionJobName: jobName,
                LanguageCode: language,
                MediaFormat: aws_config_1.default.transcribe.mediaFormat,
                Media: {
                    MediaFileUri: audioS3Uri
                },
                Settings: {
                    ShowSpeakerLabels: false,
                    MaxSpeakerLabels: 1
                }
            });
            await this.transcribeClient.send(startCommand);
            // Poll for completion
            const transcription = await this.pollTranscriptionJob(jobName);
            const processingTimeMs = Date.now() - startTime;
            logger_1.default.info('Transcription completed', {
                jobName,
                language,
                processingTimeMs
            });
            return {
                transcription: transcription.text,
                confidence: transcription.confidence,
                detectedLanguage: language,
                processingTimeMs,
                audioLengthSeconds: transcription.duration
            };
        }
        catch (error) {
            logger_1.default.error('Transcription failed', error, { audioS3Uri, language });
            throw new errors_1.VoiceProcessingError('speech_to_text', { audioS3Uri, language, error: error.message });
        }
    }
    /**
     * Poll transcription job until complete
     */
    async pollTranscriptionJob(jobName, maxAttempts = 30) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const getCommand = new client_transcribe_1.GetTranscriptionJobCommand({
                TranscriptionJobName: jobName
            });
            const response = await this.transcribeClient.send(getCommand);
            const job = response.TranscriptionJob;
            if (job?.TranscriptionJobStatus === 'COMPLETED') {
                // Fetch transcript from S3 URI
                const transcriptUri = job.Transcript?.TranscriptFileUri;
                if (!transcriptUri) {
                    throw new Error('Transcript URI not found');
                }
                // In production, fetch from S3. For now, return placeholder
                return {
                    text: 'Transcribed text placeholder',
                    confidence: 0.95,
                    duration: 10
                };
            }
            if (job?.TranscriptionJobStatus === 'FAILED') {
                throw new Error(`Transcription job failed: ${job.FailureReason}`);
            }
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        throw new Error('Transcription job timeout');
    }
    /**
     * Convert text to speech using Amazon Polly
     *
     * @param text - Text to synthesize
     * @param language - Target language code
     * @returns Audio stream
     */
    async textToSpeech(text, language = 'hi-IN') {
        const startTime = Date.now();
        try {
            logger_1.default.debug('Synthesizing speech', { textLength: text.length, language });
            // Get voice configuration for language
            const voiceConfig = aws_config_1.languageVoiceMap[language] || aws_config_1.languageVoiceMap['hi-IN'];
            const input = {
                Text: text,
                OutputFormat: aws_config_1.default.polly.outputFormat,
                VoiceId: voiceConfig.voiceId,
                Engine: aws_config_1.default.polly.engine,
                LanguageCode: voiceConfig.languageCode
            };
            const command = new client_polly_1.SynthesizeSpeechCommand(input);
            const response = await this.pollyClient.send(command);
            if (!response.AudioStream) {
                throw new Error('No audio stream returned from Polly');
            }
            // Convert stream to buffer
            const audioBuffer = await this.streamToBuffer(response.AudioStream);
            const processingTimeMs = Date.now() - startTime;
            logger_1.default.logPerformance('text_to_speech', processingTimeMs, {
                textLength: text.length,
                language,
                audioSize: audioBuffer.length
            });
            return audioBuffer;
        }
        catch (error) {
            logger_1.default.error('Text-to-speech failed', error, { text, language });
            throw new errors_1.VoiceProcessingError('text_to_speech', { text, language, error: error.message });
        }
    }
    /**
     * Helper: Convert readable stream to buffer
     */
    async streamToBuffer(stream) {
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }
    /**
     * Detect language from audio (simplified version)
     * In production, use Transcribe's automatic language detection
     */
    async detectLanguage(audioS3Uri) {
        // Placeholder implementation
        // In production, use Transcribe with IdentifyLanguage option
        logger_1.default.debug('Language detection requested', { audioS3Uri });
        return 'hi-IN';
    }
}
exports.VoiceService = VoiceService;
/**
 * Export singleton instance
 */
exports.voiceService = new VoiceService();
exports.default = exports.voiceService;
//# sourceMappingURL=voice.service.js.map