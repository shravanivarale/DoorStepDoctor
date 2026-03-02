/**
 * ASHA Worker Triage Form
 * 
 * Main interface for ASHA workers to submit triage requests
 */

import React, { useState } from 'react';
import { Mic, MicOff, Send, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import { TriageRequest, TriageResult, SupportedLanguage } from '../../services/types';
import { useAuth } from '../../contexts/AuthContext';
import AudioPlayer from './AudioPlayer';

const TriageForm: React.FC = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('female');
  const [language, setLanguage] = useState<SupportedLanguage>('hi-IN');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      setError('Please enter patient symptoms');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: TriageRequest = {
        userId: user.userId,
        symptoms: symptoms.trim(),
        language,
        patientAge: patientAge ? parseInt(patientAge) : undefined,
        patientGender,
        location: {
          district: user.district,
          state: user.state,
        },
        voiceInput: false,
        timestamp: new Date().toISOString(),
      };

      const triageResult = await apiService.submitTriage(request);
      setResult(triageResult);
      
      // Clear form after successful submission
      setSymptoms('');
      setPatientAge('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit triage request');
    } finally {
      setLoading(false);
    }
  };

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
          
          // Process the audio
          await processVoiceInput(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        setError('Unable to access microphone. Please check permissions and try again.');
      }
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setLoading(true);
    setError(null);

    try {
      // Convert audio blob to base64 for API transmission
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        try {
          // Call voice transcription API
          const transcription = await apiService.transcribeAudio(base64Audio, language);
          
          // Set the transcribed text in the symptoms field
          setSymptoms(transcription.text);
          
          // Show success message
          setError(null);
        } catch (err) {
          console.error('Transcription error:', err);
          setError('Failed to transcribe audio. Please try typing instead.');
        } finally {
          setLoading(false);
        }
      };
    } catch (err) {
      console.error('Error processing voice input:', err);
      setError('Failed to process voice input. Please try again.');
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'low':
        return 'bg-green-100 border-green-500 text-green-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Patient Triage Assessment</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Age (optional)
              </label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                min="0"
                max="120"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Gender
              </label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hi-IN">हिंदी (Hindi)</option>
              <option value="mr-IN">मराठी (Marathi)</option>
              <option value="ta-IN">தமிழ் (Tamil)</option>
              <option value="te-IN">తెలుగు (Telugu)</option>
              <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
              <option value="bn-IN">বাংলা (Bengali)</option>
              <option value="en-IN">English</option>
            </select>
          </div>

          {/* Symptoms Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient Symptoms *
            </label>
            <div className="relative">
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the patient's symptoms in detail..."
                required
                disabled={isRecording}
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={loading}
                className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                title={isRecording ? 'Stop recording' : 'Start voice recording'}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium">Recording... Click microphone to stop</p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {isRecording 
                ? 'Speak clearly in your selected language' 
                : 'Type or use voice input (minimum 10 characters)'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || symptoms.length < 10}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Send size={20} className="mr-2" />
                Submit Triage Request
              </>
            )}
          </button>
        </form>

        {/* Triage Result */}
        {result && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Triage Result</h3>
            
            {/* Urgency Level */}
            <div className={`border-l-4 rounded-lg p-4 ${getUrgencyColor(result.response.urgencyLevel)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Urgency Level</p>
                  <p className="text-2xl font-bold uppercase">{result.response.urgencyLevel}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Risk Score</p>
                  <p className="text-2xl font-bold">{(result.response.riskScore * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-2">Recommended Action:</p>
                  <p className="text-blue-800">{result.response.recommendedAction}</p>
                </div>
                <AudioPlayer 
                  text={result.response.recommendedAction}
                  language={language}
                  className="ml-2"
                />
              </div>
            </div>

            {/* PHC Referral */}
            {result.response.referToPhc && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-900 mb-2">⚠️ PHC Referral Required</p>
                <p className="text-orange-800">Please refer this patient to the Primary Health Center for further evaluation.</p>
              </div>
            )}

            {/* Red Flags */}
            {result.response.redFlags && result.response.redFlags.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900 mb-2">⚠️ Warning Signs:</p>
                <ul className="list-disc list-inside text-red-800 space-y-1">
                  {result.response.redFlags.map((flag, index) => (
                    <li key={index}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Guideline Reference */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Clinical Guideline:</p>
              <p className="text-sm text-gray-600">{result.response.citedGuideline}</p>
              <p className="text-xs text-gray-500 mt-2">
                Confidence: {(result.response.confidenceScore * 100).toFixed(0)}% | 
                Processing Time: {result.metadata.processingTimeMs}ms
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriageForm;
