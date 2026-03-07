import React from 'react';
import { Check } from 'lucide-react';

interface SymptomTagsProps {
  selectedSymptoms: string[];
  onToggle: (symptom: string) => void;
  language: string;
}

const symptomsList = {
  en: [
    'Fever', 'Cough', 'Headache', 'Vomiting', 'Diarrhea',
    'Chest Pain', 'Difficulty Breathing', 'Unconscious', 'Bleeding',
    'Abdominal Pain', 'Dizziness', 'Weakness', 'Rash', 'Swelling'
  ],
  hi: [
    'बुखार', 'खांसी', 'सिरदर्द', 'उल्टी', 'दस्त',
    'सीने में दर्द', 'सांस लेने में कठिनाई', 'बेहोश', 'खून बहना',
    'पेट दर्द', 'चक्कर', 'कमजोरी', 'दाने', 'सूजन'
  ],
  mr: [
    'ताप', 'खोकला', 'डोकेदुखी', 'उलट्या', 'जुलाब',
    'छातीत दुखणे', 'श्वास घेण्यात अडचण', 'बेशुद्ध', 'रक्तस्त्राव',
    'पोटदुखी', 'चक्कर', 'अशक्तपणा', 'पुरळ', 'सूज'
  ]
};

const SymptomTags: React.FC<SymptomTagsProps> = ({ selectedSymptoms, onToggle, language }) => {
  const symptoms = symptomsList[language as keyof typeof symptomsList] || symptomsList.en;

  return (
    <div className="symptom-tags">
      {symptoms.map((symptom, index) => {
        const isSelected = selectedSymptoms.includes(symptom);
        return (
          <button
            key={index}
            type="button"
            onClick={() => onToggle(symptom)}
            className={`symptom-tag ${isSelected ? 'selected' : ''}`}
          >
            {isSelected && <Check size={16} />}
            {symptom}
          </button>
        );
      })}
    </div>
  );
};

export default SymptomTags;
