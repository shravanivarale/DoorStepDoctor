/**
 * Voice Processing Service
 * 
 * Handles voice-to-text (Amazon Transcribe) and text-to-voice (Amazon Polly)
 * for multi-language support in the triage system.
 */

import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand
} from '@aws-sdk/client-transcribe-streaming';
import {
  PollyClient,
  SynthesizeSpeechCommand,
  SynthesizeSpeechCommandInput
} from '@aws-sdk/client-polly';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

import config, { languageVoiceMap } from '../config/aws.config';
import logger from '../utils/logger';
import { VoiceProcessingError } from '../utils/errors';
import {
  SupportedLanguage,
  VoiceProcessingResult
} from '../types/triage.types';

/**
 * Voice Service Class
 */
export class VoiceService {
  private transcribeStreamingClient: TranscribeStreamingClient;
  private pollyClient: PollyClient;
  private cwClient: CloudWatchClient;

  constructor() {
    this.transcribeStreamingClient = new TranscribeStreamingClient({ region: config.region });
    this.pollyClient = new PollyClient({ region: config.region });
    this.cwClient = new CloudWatchClient({ region: config.region });
  }

  /**
   * Convert speech to text using Amazon Transcribe
   * 
   * @param audioS3Uri - S3 URI of audio file
   * @param language - Target language code
   * @returns Transcription result
   */
  async speechToText(
    audioBuffer: Buffer,
    language: SupportedLanguage = 'hi-IN'
  ): Promise<VoiceProcessingResult> {
    const startTime = Date.now();

    try {
      logger.debug('Starting stream transcription', { language });

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

      const command = new StartStreamTranscriptionCommand({
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
          await this.cwClient.send(new PutMetricDataCommand({
            Namespace: 'ASHA-Triage',
            MetricData: [{
              MetricName: 'stt_low_confidence_count',
              Value: 1,
              Unit: 'Count',
              Dimensions: [{ Name: 'LanguageCode', Value: language }]
            }]
          }));
        } catch (e) {
          logger.error('Failed to emit stt_low_confidence_count metric', e as Error);
        }
      }

      logger.info('Transcription completed', {
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

    } catch (error) {
      logger.error('Transcription failed', error as Error, { language });
      throw new VoiceProcessingError(
        'speech_to_text',
        { language, error: (error as Error).message }
      );
    }
  }

  /**
   * Convert text to speech using Amazon Polly
   * 
   * @param text - Text to synthesize
   * @param language - Target language code
   * @returns Audio stream
   */
  async textToSpeech(
    text: string,
    language: SupportedLanguage = 'hi-IN'
  ): Promise<Buffer> {
    const startTime = Date.now();

    try {
      logger.debug('Synthesizing speech', { textLength: text.length, language });

      // Get voice configuration for language
      const voiceConfig = languageVoiceMap[language] || languageVoiceMap['hi-IN'];

      const input: SynthesizeSpeechCommandInput = {
        Text: text,
        OutputFormat: config.polly.outputFormat as 'mp3' | 'ogg_vorbis' | 'pcm',
        VoiceId: voiceConfig.voiceId as any,
        Engine: config.polly.engine as 'standard' | 'neural',
        LanguageCode: voiceConfig.languageCode as any
      };

      const command = new SynthesizeSpeechCommand(input);
      const response = await this.pollyClient.send(command);

      if (!response.AudioStream) {
        throw new Error('No audio stream returned from Polly');
      }

      // Convert stream to buffer
      const audioBuffer = await this.streamToBuffer(response.AudioStream);

      const processingTimeMs = Date.now() - startTime;

      logger.logPerformance('text_to_speech', processingTimeMs, {
        textLength: text.length,
        language,
        audioSize: audioBuffer.length
      });

      return audioBuffer;

    } catch (error) {
      logger.error('Text-to-speech failed', error as Error, { text, language });
      throw new VoiceProcessingError(
        'text_to_speech',
        { text, language, error: (error as Error).message }
      );
    }
  }

  /**
   * Helper: Convert readable stream to buffer
   */
  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Uint8Array[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }


}

/**
 * Export singleton instance
 */
export const voiceService = new VoiceService();
export default voiceService;
