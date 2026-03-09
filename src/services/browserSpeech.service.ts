/**
 * Browser-based Speech Service
 * Uses Web Speech API - 100% free, supports all Indian languages
 * Works in Chrome, Edge, Safari
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  language: string;
}

export class BrowserSpeechService {
  private recognition: any;
  private synthesis: SpeechSynthesis;

  constructor() {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }

    // Initialize Speech Synthesis
    this.synthesis = window.speechSynthesis;
  }

  /**
   * Check if browser supports speech recognition
   */
  isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }

  /**
   * Speech-to-Text
   * Supports all Indian languages
   */
  async speechToText(language: string = 'hi-IN'): Promise<SpeechRecognitionResult> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      this.recognition.lang = language;

      this.recognition.onresult = (event: any) => {
        const result = event.results[0][0];
        resolve({
          transcript: result.transcript,
          confidence: result.confidence,
          language: language
        });
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.start();
    });
  }

  /**
   * Text-to-Speech
   * Supports all Indian languages
   */
  async textToSpeech(text: string, language: string = 'hi-IN'): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find a native voice for the language
      const voices = this.synthesis.getVoices();
      const nativeVoice = voices.find(voice => voice.lang === language);
      if (nativeVoice) {
        utterance.voice = nativeVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  /**
   * Get available voices for a language
   */
  getAvailableVoices(language?: string): SpeechSynthesisVoice[] {
    const voices = this.synthesis.getVoices();
    if (language) {
      return voices.filter(voice => voice.lang.startsWith(language.split('-')[0]));
    }
    return voices;
  }

  /**
   * Stop any ongoing speech
   */
  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

// Supported Indian languages
export const INDIAN_LANGUAGES = [
  { code: 'hi-IN', name: 'हिंदी (Hindi)', nativeName: 'हिंदी' },
  { code: 'en-IN', name: 'English (India)', nativeName: 'English' },
  { code: 'mr-IN', name: 'मराठी (Marathi)', nativeName: 'मराठी' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)', nativeName: 'தமிழ்' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)', nativeName: 'తెలుగు' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml-IN', name: 'മലയാളം (Malayalam)', nativeName: 'മലയാളം' },
  { code: 'bn-IN', name: 'বাংলা (Bengali)', nativeName: 'বাংলা' },
  { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)', nativeName: 'ગુજરાતી' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or-IN', name: 'ଓଡ଼ିଆ (Odia)', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as-IN', name: 'অসমীয়া (Assamese)', nativeName: 'অসমীয়া' },
];

export default BrowserSpeechService;
