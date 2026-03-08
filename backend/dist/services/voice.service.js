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
const client_transcribe_streaming_1 = require("@aws-sdk/client-transcribe-streaming");
const client_polly_1 = require("@aws-sdk/client-polly");
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
const aws_config_1 = __importStar(require("../config/aws.config"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
/**
 * Voice Service Class
 */
class VoiceService {
    constructor() {
        this.transcribeStreamingClient = new client_transcribe_streaming_1.TranscribeStreamingClient({ region: aws_config_1.default.region });
        this.pollyClient = new client_polly_1.PollyClient({ region: aws_config_1.default.region });
        this.cwClient = new client_cloudwatch_1.CloudWatchClient({ region: aws_config_1.default.region });
    }
    /**
     * Convert speech to text using Amazon Transcribe
     *
     * @param audioS3Uri - S3 URI of audio file
     * @param language - Target language code
     * @returns Transcription result
     */
    async speechToText(audioBuffer, language = 'hi-IN') {
        const startTime = Date.now();
        try {
            logger_1.default.debug('Starting stream transcription', { language });
            const audioStream = (async function* () {
                const chunkSize = 16 * 1024; // 16KB chunks
                for (let i = 0; i < audioBuffer.length; i += chunkSize) {
                    yield {
                        AudioEvent: {
                            AudioChunk: audioBuffer.slice(i, i + chunkSize)
                        }
                    };
                }
            })();
            const command = new client_transcribe_streaming_1.StartStreamTranscriptionCommand({
                LanguageCode: language,
                MediaEncoding: 'pcm', // Default to PCM
                MediaSampleRateHertz: 16000,
                AudioStream: audioStream
            });
            const response = await this.transcribeStreamingClient.send(command);
            let finalTranscript = '';
            let confidenceSum = 0;
            let wordCount = 0;
            if (response.TranscriptResultStream) {
                for await (const event of response.TranscriptResultStream) {
                    if (event.TranscriptEvent) {
                        const results = event.TranscriptEvent.Transcript?.Results;
                        if (results && results.length > 0) {
                            const result = results[0];
                            if (!result.IsPartial && result.Alternatives && result.Alternatives.length > 0) {
                                const alt = result.Alternatives[0];
                                finalTranscript += (alt.Transcript || '') + ' ';
                                if (alt.Items) {
                                    for (const item of alt.Items) {
                                        if (item.Confidence != null) {
                                            confidenceSum += item.Confidence;
                                            wordCount++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            const averageConfidence = wordCount > 0 ? confidenceSum / wordCount : 0;
            const processingTimeMs = Date.now() - startTime;
            const audioLengthSeconds = audioBuffer.length / 32000;
            let requiresConfirmation = false;
            let message;
            // ── P2-3: Voice STT Language Validation ──
            if (averageConfidence > 0 && averageConfidence < 0.75) {
                requiresConfirmation = true;
                message = "Could not clearly hear. Please confirm or re-record.";
                // Note: Bengali, Kannada, and Telugu have known accuracy limitations in rural dialects.
                // Run quarterly benchmarks against a labelled audio corpus.
                try {
                    await this.cwClient.send(new client_cloudwatch_1.PutMetricDataCommand({
                        Namespace: 'ASHA-Triage',
                        MetricData: [{
                                MetricName: 'stt_low_confidence_count',
                                Value: 1,
                                Unit: 'Count',
                                Dimensions: [{ Name: 'LanguageCode', Value: language }]
                            }]
                    }));
                }
                catch (e) {
                    logger_1.default.error('Failed to emit stt_low_confidence_count metric', e);
                }
            }
            logger_1.default.info('Transcription completed', {
                language,
                processingTimeMs,
                averageConfidence
            });
            return {
                transcription: finalTranscript.trim() || 'No speech detected',
                confidence: averageConfidence,
                detectedLanguage: language,
                processingTimeMs,
                audioLengthSeconds,
                requiresConfirmation,
                message
            };
        }
        catch (error) {
            logger_1.default.error('Transcription failed', error, { language });
            throw new errors_1.VoiceProcessingError('speech_to_text', { language, error: error.message });
        }
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
}
exports.VoiceService = VoiceService;
/**
 * Export singleton instance
 */
exports.voiceService = new VoiceService();
exports.default = exports.voiceService;
//# sourceMappingURL=voice.service.js.map