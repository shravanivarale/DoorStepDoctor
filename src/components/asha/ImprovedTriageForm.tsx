import React, { useState } from 'react';
import { Mic, MicOff, Send, AlertCircle, Check } from 'lucide-react';
import { apiService } from '../../services/api';
import { TriageRequest, TriageResult, SupportedLanguage } from '../../services/types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AudioPlayer from './AudioPlayer';
import SymptomTags from './SymptomTags';

const ImprovedTriageForm: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [symptoms, setSymptoms] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('female');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const languageMap: Record<string, SupportedLanguage> = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    bn: 'bn-IN'
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const combinedSymptoms = [
      ...selectedTags,
      symptoms.trim()
    ].filter(Boolean).join(', ');

    if (!combinedSymptoms) {
      setError(t('triage.errorNoSymptoms') || 'Please enter or select patient symptoms');
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
        symptoms: combinedSymptoms,
        language: languageMap[language] || 'en-IN',
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
      
      // Clear form
      setSymptoms('');
      setSelectedTags([]);
      setPatientAge('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit triage request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-green-800">
          {t('triage.title')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('triage.age')}
              </label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                min="0"
                max="120"
                className="input"
                placeholder={t('triage.agePlaceholder') || 'Enter age'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('triage.gender')}
              </label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as any)}
                className="input"
              >
                <option value="female">{t('triage.female') || 'Female'}</option>
                <option value="male">{t('triage.male') || 'Male'}</option>
                <option value="other">{t('triage.other') || 'Other'}</option>
              </select>
            </div>
          </div>

          {/* Quick Symptom Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('triage.selectTags')}
            </label>
            <SymptomTags
              selectedSymptoms={selectedTags}
              onToggle={handleToggleTag}
              language={language}
            />
          </div>

          {/* Additional Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('triage.additionalSymptoms') || 'Additional Details (Optional)'}
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
              className="input"
              placeholder={t('triage.symptomsPlaceholder') || 'Describe any additional symptoms...'}
              disabled={isRecording}
            />
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
            disabled={loading || (selectedTags.length === 0 && symptoms.length < 5)}
            className="button w-full text-lg py-4"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('triage.processing') || 'Processing...'}
              </span>
            ) : (
              <>
                <Send size={20} className="inline mr-2" />
                {t('triage.submit')}
              </>
            )}
          </button>
        </form>

        {/* Triage Result */}
        {result && (
          <div className="mt-8 space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">
              {t('triage.result') || 'Assessment Result'}
            </h3>
            
            {/* Urgency Level */}
            <div className={`border-l-4 rounded-lg p-4 ${
              result.response.urgencyLevel === 'emergency' ? 'bg-red-100 border-red-500' :
              result.response.urgencyLevel === 'high' ? 'bg-orange-100 border-orange-500' :
              result.response.urgencyLevel === 'medium' ? 'bg-yellow-100 border-yellow-500' :
              'bg-green-100 border-green-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('triage.urgency') || 'Urgency Level'}</p>
                  <p className="text-2xl font-bold uppercase">{result.response.urgencyLevel}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{t('triage.risk') || 'Risk Score'}</p>
                  <p className="text-2xl font-bold">{(result.response.riskScore * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-2">
                {t('triage.recommendation') || 'Recommended Action:'}
              </p>
              <p className="text-green-800">{result.response.recommendedAction}</p>
            </div>

            {/* PHC Referral */}
            {result.response.referToPhc && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-900 mb-2">
                  ⚠️ {t('triage.referral') || 'PHC Referral Required'}
                </p>
                <p className="text-orange-800">
                  {t('triage.referralDesc') || 'Please refer this patient to the Primary Health Center.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedTriageForm;
