/**
 * Voice Processing Service
 * 
 * Handles voice-to-text (Amazon Transcribe) and text-to-voice (Amazon Polly)
 * for multi-language support in the triage system.
 */

import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand
} from '@aws-sdk/client-transcribe';
import {
  PollyClient,
  SynthesizeSpeechCommand,
  SynthesizeSpeechCommandInput
} from '@aws-sdk/client-polly';

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
  private transcribeClient: TranscribeClient;
  private pollyClient: PollyClient;
  
  constructor() {
    this.transcribeClient = new TranscribeClient({ region: config.region });
    this.pollyClient = new PollyClient({ region: config.region });
  }
  
  /**
   * Convert speech to text using Amazon Transcribe
   * 
   * @param audioS3Uri - S3 URI of audio file
   * @param language - Target language code
   * @returns Transcription result
   */
  async speechToText(
    audioS3Uri: string,
    language: SupportedLanguage = 'hi-IN'
  ): Promise<VoiceProcessingResult> {
    const startTime = Date.now();
    const jobName = `triage-${Date.now()}`;
    
    try {
      logger.debug('Starting transcription job', { audioS3Uri, language });
      
      // Start transcription job
      const startCommand = new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: language,
        MediaFormat: config.transcribe.mediaFormat as any,
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
      
      logger.info('Transcription completed', {
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
      
    } catch (error) {
      logger.error('Transcription failed', error as Error, { audioS3Uri, language });
      throw new VoiceProcessingError(
        'speech_to_text',
        { audioS3Uri, language, error: (error as Error).message }
      );
    }
  }
  
  /**
   * Poll transcription job until complete
   */
  private async pollTranscriptionJob(
    jobName: string,
    maxAttempts: number = 30
  ): Promise<{ text: string; confidence: number; duration: number }> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const getCommand = new GetTranscriptionJobCommand({
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
  
  /**
   * Detect language from audio (simplified version)
   * In production, use Transcribe's automatic language detection
   */
  async detectLanguage(audioS3Uri: string): Promise<SupportedLanguage> {
    // Placeholder implementation
    // In production, use Transcribe with IdentifyLanguage option
    logger.debug('Language detection requested', { audioS3Uri });
    return 'hi-IN';
  }
}

/**
 * Export singleton instance
 */
export const voiceService = new VoiceService();
export default voiceService;
