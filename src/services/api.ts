/**
 * API Service Layer
 * 
 * Handles all communication with the AWS backend API
 */

import { TriageRequest, TriageResult, UserSession } from './types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3000';

class APIService {
  private token: string | null = null;

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && !endpoint.includes('/auth/')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(username: string, password: string): Promise<UserSession> {
    const session = await this.request<UserSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    this.setToken(session.sessionToken);
    return session;
  }

  /**
   * Register new user
   */
  async register(userData: {
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    role: string;
    district: string;
    state: string;
  }): Promise<{ userId: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Validate current token
   */
  async validateToken(): Promise<UserSession> {
    return this.request<UserSession>('/auth/validate', {
      method: 'GET',
    });
  }

  /**
   * Logout user
   */
  logout() {
    this.clearToken();
  }

  /**
   * Submit triage request
   */
  async submitTriage(request: TriageRequest): Promise<TriageResult> {
    return this.request<TriageResult>('/triage', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get triage history for user
   */
  async getTriageHistory(userId: string): Promise<TriageResult[]> {
    return this.request<TriageResult[]>(`/triage/history?userId=${userId}`, {
      method: 'GET',
    });
  }

  /**
   * Convert text to speech
   */
  async textToSpeech(text: string, language: string): Promise<{ audio: string; format: string }> {
    return this.request('/voice/tts', {
      method: 'POST',
      body: JSON.stringify({ text, language }),
    });
  }

  /**
   * Convert speech to text
   */
  async speechToText(audioS3Uri: string, language: string): Promise<{
    transcription: string;
    confidence: number;
    detectedLanguage: string;
  }> {
    return this.request('/voice/stt', {
      method: 'POST',
      body: JSON.stringify({ audioS3Uri, language }),
    });
  }

  /**
   * Get emergency cases (for PHC dashboard)
   */
  async getEmergencyCases(district: string, status: string = 'pending'): Promise<any[]> {
    return this.request(`/emergency/cases?district=${district}&status=${status}`, {
      method: 'GET',
    });
  }

  /**
   * Update emergency case status
   */
  async updateEmergencyStatus(emergencyId: string, status: string): Promise<{ message: string }> {
    return this.request('/emergency/status', {
      method: 'PUT',
      body: JSON.stringify({ emergencyId, status }),
    });
  }

  /**
   * Get emergency contact number
   */
  async getEmergencyContact(): Promise<{ contact: string }> {
    return this.request('/emergency/contact', {
      method: 'GET',
    });
  }

  /**
   * Transcribe audio to text
   */
  async transcribeAudio(audioBase64: string, language: string): Promise<{
    text: string;
    confidence: number;
    detectedLanguage: string;
  }> {
    return this.request('/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify({ 
        audio: audioBase64,
        language,
        format: 'webm'
      }),
    });
  }

  /**
   * Get audio for text (TTS)
   */
  async getAudioForText(text: string, language: string): Promise<{
    audioUrl: string;
    format: string;
  }> {
    return this.request('/voice/synthesize', {
      method: 'POST',
      body: JSON.stringify({ text, language }),
    });
  }
}

export const apiService = new APIService();
export default apiService;
