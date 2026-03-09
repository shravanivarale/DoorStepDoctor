# 🌍 Multilingual Support - Free Alternatives

## Current AWS Services & Limitations

### Amazon Transcribe (Speech-to-Text)
- **Location**: `backend/src/handlers/voice.handler.ts` - Line 150-180
- **Function**: `speechToTextHandler`
- **Supported**: Hindi, English, Tamil, Telugu (limited)
- **Missing**: Kannada, Malayalam, Bengali, Gujarati, Punjabi, Odia, Assamese
- **Cost**: $0.024/minute

### Amazon Polly (Text-to-Speech)
- **Location**: `backend/src/handlers/voice.handler.ts` - Line 100-130
- **Function**: `textToSpeechHandler`
- **Supported**: Hindi (Aditi), English
- **Missing**: Most regional languages
- **Cost**: $4 per 1M characters

## 🆓 Free Alternatives (GitHub Student Pack Compatible)

### Option 1: Google Cloud Speech & TTS (Best for Indian Languages)
**GitHub Student Pack**: $300 free credits

#### Advantages:
- ✅ **22 Indian languages** supported
- ✅ Hindi, Marathi, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Punjabi, Odia, Assamese
- ✅ Better accuracy for Indian accents
- ✅ Free tier: 60 minutes STT/month, 1M characters TTS/month
- ✅ $300 credits with Student Pack

#### Implementation:
```javascript
// Replace in backend/src/services/voice.service.ts
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';

// Speech-to-Text
const client = new speech.SpeechClient();
const [response] = await client.recognize({
  config: {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'hi-IN', // or 'mr-IN', 'ta-IN', etc.
  },
  audio: { content: audioBytes },
});

// Text-to-Speech
const ttsClient = new textToSpeech.TextToSpeechClient();
const [response] = await ttsClient.synthesizeSpeech({
  input: { text: 'आपका स्वागत है' },
  voice: { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-A' },
  audioConfig: { audioEncoding: 'MP3' },
});
```

### Option 2: Azure Cognitive Services (Good Alternative)
**GitHub Student Pack**: $100 free credits

#### Advantages:
- ✅ 10+ Indian languages
- ✅ Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati
- ✅ Free tier: 5 hours STT/month, 0.5M characters TTS/month
- ✅ Neural voices available

### Option 3: Web Speech API (100% Free, Browser-based)
**GitHub Student Pack**: Not needed - completely free!

#### Advantages:
- ✅ **Completely free**
- ✅ No backend changes needed
- ✅ Works in browser (Chrome, Edge)
- ✅ Supports 50+ languages including all Indian languages
- ✅ No API costs

#### Implementation:
```javascript
// Frontend only - src/components/ai-assistant/VoiceInterface.tsx

// Speech-to-Text (Browser)
const recognition = new window.webkitSpeechRecognition();
recognition.lang = 'hi-IN'; // or 'mr-IN', 'ta-IN', etc.
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  console.log('User said:', transcript);
};
recognition.start();

// Text-to-Speech (Browser)
const utterance = new SpeechSynthesisUtterance('आपका स्वागत है');
utterance.lang = 'hi-IN';
window.speechSynthesis.speak(utterance);
```

#### Limitations:
- ⚠️ Requires internet connection
- ⚠️ Works only in Chrome/Edge browsers
- ⚠️ Quality varies by browser

### Option 4: Bhashini (Government of India - FREE!)
**Best for Indian Languages** 🇮🇳

#### Advantages:
- ✅ **100% FREE** - Government initiative
- ✅ **All 22 Indian languages**
- ✅ Built specifically for Indian languages
- ✅ Speech-to-Text, Text-to-Speech, Translation
- ✅ No credit card required
- ✅ Unlimited usage for non-commercial

#### How to Use:
1. Register at: https://bhashini.gov.in/
2. Get API key (free)
3. Integrate with your backend

```javascript
// backend/src/services/bhashini.service.ts
const response = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${BHASHINI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    pipelineTasks: [{
      taskType: 'asr', // Speech-to-Text
      config: { language: { sourceLanguage: 'hi' } }
    }],
    inputData: { audio: [{ audioContent: base64Audio }] }
  })
});
```

## 🎯 My Recommendation

### For AWS AI for Bharat Submission:

**Use Hybrid Approach:**

1. **Keep AWS Transcribe/Polly** for Hindi & English (shows AWS integration)
2. **Add Bhashini** for other Indian languages (shows awareness of Indian tech)
3. **Add Web Speech API** as fallback (free, works everywhere)

### Implementation Priority:

#### Phase 1 (Current - AWS Only):
```
Hindi, English → AWS Transcribe/Polly
```

#### Phase 2 (Add Bhashini - 2 hours work):
```
Hindi, English → AWS Transcribe/Polly
Marathi, Tamil, Telugu, Kannada, etc. → Bhashini
```

#### Phase 3 (Add Browser Fallback - 1 hour work):
```
All languages → Web Speech API (if AWS/Bhashini unavailable)
```

## 📝 Code Changes Needed

### 1. Update voice.service.ts
```typescript
// backend/src/services/voice.service.ts

async speechToText(audioUri: string, language: string): Promise<string> {
  // Route based on language
  if (['hi-IN', 'en-IN'].includes(language)) {
    return this.awsTranscribe(audioUri, language);
  } else {
    return this.bhashiniTranscribe(audioUri, language);
  }
}

async textToSpeech(text: string, language: string): Promise<Buffer> {
  if (['hi-IN', 'en-IN'].includes(language)) {
    return this.awsPolly(text, language);
  } else {
    return this.bhashiniTTS(text, language);
  }
}
```

### 2. Add Language Selector in Frontend
```typescript
// src/components/common/LanguageSwitcher.tsx
const languages = [
  { code: 'hi-IN', name: 'हिंदी', service: 'AWS' },
  { code: 'en-IN', name: 'English', service: 'AWS' },
  { code: 'mr-IN', name: 'मराठी', service: 'Bhashini' },
  { code: 'ta-IN', name: 'தமிழ்', service: 'Bhashini' },
  { code: 'te-IN', name: 'తెలుగు', service: 'Bhashini' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ', service: 'Bhashini' },
  { code: 'ml-IN', name: 'മലയാളം', service: 'Bhashini' },
  { code: 'bn-IN', name: 'বাংলা', service: 'Bhashini' },
  { code: 'gu-IN', name: 'ગુજરાતી', service: 'Bhashini' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ', service: 'Bhashini' },
];
```

## 💰 Cost Comparison

### Current (AWS Only):
- Hindi/English: $0.024/min STT + $4/1M chars TTS
- Other languages: Not supported
- **Monthly cost**: ~$50-100 for moderate usage

### With Bhashini:
- Hindi/English: $0.024/min (AWS)
- All other Indian languages: **FREE** (Bhashini)
- **Monthly cost**: ~$10-20

### With Web Speech API:
- All languages: **FREE**
- **Monthly cost**: $0

## 🚀 Quick Implementation (30 minutes)

Want me to:
1. Add Bhashini integration for regional languages?
2. Add Web Speech API as browser fallback?
3. Update language selector with all Indian languages?

This will make your project support **all 22 Indian languages** and show innovation! 🇮🇳

## 📚 Resources

- **Bhashini**: https://bhashini.gov.in/
- **Google Cloud**: https://cloud.google.com/speech-to-text
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **GitHub Student Pack**: https://education.github.com/pack

---

**Recommendation**: Add Bhashini integration now (30 min work) to support all Indian languages for free! Perfect for AWS AI for Bharat! 🎯
