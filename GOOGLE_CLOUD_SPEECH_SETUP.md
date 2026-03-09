# 🎤 Google Cloud Speech API Setup (GitHub Student Pack)

## Why Google Cloud Speech?
- ✅ **$300 free credits** with GitHub Student Pack
- ✅ **22+ Indian languages** supported
- ✅ **Best accuracy** for Indian accents
- ✅ **Free tier**: 60 minutes STT/month + 1M characters TTS/month
- ✅ **Better than AWS** for regional Indian languages

## 📋 Step-by-Step Setup (15 minutes)

### Step 1: Activate GitHub Student Pack (if not done)
1. Go to: https://education.github.com/pack
2. Click "Get Student Benefits"
3. Sign in with your GitHub account
4. Verify student status (upload student ID/enrollment proof)
5. Wait for approval (usually instant)

### Step 2: Claim Google Cloud Credits
1. Go to GitHub Student Pack benefits page
2. Find "Google Cloud Platform"
3. Click "Get access to Google Cloud Platform"
4. You'll be redirected to Google Cloud
5. Sign in with your Google account
6. **$300 credits** will be automatically applied!

### Step 3: Create Google Cloud Project
1. Go to: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Project name: `doorstep-doctor`
4. Click "Create"
5. Wait for project creation (30 seconds)

### Step 4: Enable Speech APIs
1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Cloud Speech-to-Text API"
3. Click on it → Click "Enable"
4. Go back to Library
5. Search for "Cloud Text-to-Speech API"
6. Click on it → Click "Enable"

### Step 5: Create Service Account & Get API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Service account name: `doorstep-doctor-speech`
4. Click "Create and Continue"
5. Role: Select "Project" → "Editor"
6. Click "Continue" → "Done"

### Step 6: Generate JSON Key
1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON"
5. Click "Create"
6. **JSON file will download** - Save it securely!

### Step 7: Add Credentials to Backend
1. Rename downloaded file to `google-credentials.json`
2. Move it to `backend/` folder
3. Add to `.gitignore`:
   ```
   backend/google-credentials.json
   ```

### Step 8: Install Google Cloud SDK
```powershell
npm install @google-cloud/speech @google-cloud/text-to-speech
```

### Step 9: Update Backend Environment Variables
Add to `backend/.env`:
```env
# Google Cloud Speech API
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=doorstep-doctor
```

### Step 10: Create Google Speech Service

Create `backend/src/services/googleSpeech.service.ts`:
```typescript
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';
import { logger } from '../utils/logger';

export class GoogleSpeechService {
  private speechClient: speech.SpeechClient;
  private ttsClient: textToSpeech.TextToSpeechClient;

  constructor() {
    this.speechClient = new speech.SpeechClient();
    this.ttsClient = new textToSpeech.TextToSpeechClient();
  }

  /**
   * Speech-to-Text for Indian languages
   */
  async transcribeAudio(
    audioContent: Buffer,
    languageCode: string = 'hi-IN'
  ): Promise<string> {
    try {
      const audio = {
        content: audioContent.toString('base64'),
      };

      const config = {
        encoding: 'LINEAR16' as const,
        sampleRateHertz: 16000,
        languageCode: languageCode,
        alternativeLanguageCodes: ['en-IN'], // Fallback
        enableAutomaticPunctuation: true,
        model: 'default',
      };

      const request = {
        audio: audio,
        config: config,
      };

      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        ?.map(result => result.alternatives?.[0]?.transcript)
        .join('\n') || '';

      logger.info('Google Speech transcription successful', {
        language: languageCode,
        length: transcription.length,
      });

      return transcription;
    } catch (error) {
      logger.error('Google Speech transcription failed', { error });
      throw error;
    }
  }

  /**
   * Text-to-Speech for Indian languages
   */
  async synthesizeSpeech(
    text: string,
    languageCode: string = 'hi-IN'
  ): Promise<Buffer> {
    try {
      // Map language codes to voice names
      const voiceMap: Record<string, string> = {
        'hi-IN': 'hi-IN-Wavenet-A',
        'en-IN': 'en-IN-Wavenet-A',
        'mr-IN': 'mr-IN-Wavenet-A',
        'ta-IN': 'ta-IN-Wavenet-A',
        'te-IN': 'te-IN-Wavenet-A',
        'kn-IN': 'kn-IN-Wavenet-A',
        'ml-IN': 'ml-IN-Wavenet-A',
        'bn-IN': 'bn-IN-Wavenet-A',
        'gu-IN': 'gu-IN-Wavenet-A',
        'pa-IN': 'pa-IN-Wavenet-A',
      };

      const request = {
        input: { text: text },
        voice: {
          languageCode: languageCode,
          name: voiceMap[languageCode] || voiceMap['hi-IN'],
          ssmlGender: 'NEUTRAL' as const,
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: 0.9,
          pitch: 0,
        },
      };

      const [response] = await this.ttsClient.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('No audio content in response');
      }

      logger.info('Google TTS synthesis successful', {
        language: languageCode,
        textLength: text.length,
      });

      return Buffer.from(response.audioContent as Uint8Array);
    } catch (error) {
      logger.error('Google TTS synthesis failed', { error });
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return [
      'hi-IN', // Hindi
      'en-IN', // English
      'mr-IN', // Marathi
      'ta-IN', // Tamil
      'te-IN', // Telugu
      'kn-IN', // Kannada
      'ml-IN', // Malayalam
      'bn-IN', // Bengali
      'gu-IN', // Gujarati
      'pa-IN', // Punjabi
      'or-IN', // Odia
      'as-IN', // Assamese
    ];
  }
}

export default GoogleSpeechService;
```

### Step 11: Update Voice Handler

Update `backend/src/handlers/voice.handler.ts`:
```typescript
import GoogleSpeechService from '../services/googleSpeech.service';

const googleSpeech = new GoogleSpeechService();

// In speechToTextHandler:
const transcript = await googleSpeech.transcribeAudio(audioBuffer, languageCode);

// In textToSpeechHandler:
const audioBuffer = await googleSpeech.synthesizeSpeech(text, languageCode);
```

### Step 12: Test the Integration

```powershell
cd backend
npm test
```

## 🌍 Supported Indian Languages

| Language | Code | Voice Quality |
|----------|------|---------------|
| Hindi | hi-IN | ⭐⭐⭐⭐⭐ Excellent |
| English (India) | en-IN | ⭐⭐⭐⭐⭐ Excellent |
| Marathi | mr-IN | ⭐⭐⭐⭐ Very Good |
| Tamil | ta-IN | ⭐⭐⭐⭐ Very Good |
| Telugu | te-IN | ⭐⭐⭐⭐ Very Good |
| Kannada | kn-IN | ⭐⭐⭐⭐ Very Good |
| Malayalam | ml-IN | ⭐⭐⭐⭐ Very Good |
| Bengali | bn-IN | ⭐⭐⭐⭐ Very Good |
| Gujarati | gu-IN | ⭐⭐⭐⭐ Very Good |
| Punjabi | pa-IN | ⭐⭐⭐ Good |
| Odia | or-IN | ⭐⭐⭐ Good |
| Assamese | as-IN | ⭐⭐⭐ Good |

## 💰 Cost Breakdown

### With GitHub Student Pack:
- **$300 free credits** (lasts 12 months)
- After credits: Free tier applies

### Free Tier (Monthly):
- **Speech-to-Text**: 60 minutes free
- **Text-to-Speech**: 1 million characters free

### Paid Pricing (after free tier):
- **STT**: $0.006 per 15 seconds (~$0.024/minute)
- **TTS**: $4 per 1 million characters

### Example Usage:
- 1000 voice queries/month = ~30 minutes STT + 100K chars TTS
- **Cost**: $0 (within free tier)
- With $300 credits: Can handle 12,500 minutes = **208 hours** of audio!

## 🔒 Security Best Practices

1. **Never commit** `google-credentials.json` to Git
2. Add to `.gitignore`:
   ```
   backend/google-credentials.json
   *.json
   !package.json
   !tsconfig.json
   ```

3. For production, use environment variables:
   ```env
   GOOGLE_CREDENTIALS_BASE64=<base64-encoded-json>
   ```

4. Rotate keys every 90 days

## 🧪 Testing

Test with curl:
```bash
# Test Speech-to-Text
curl -X POST http://localhost:3000/voice/stt \
  -H "Content-Type: application/json" \
  -d '{"audioUri": "s3://bucket/audio.wav", "language": "hi-IN"}'

# Test Text-to-Speech
curl -X POST http://localhost:3000/voice/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "नमस्ते", "language": "hi-IN"}'
```

## 📊 Comparison: AWS vs Google Cloud

| Feature | AWS | Google Cloud |
|---------|-----|--------------|
| Indian Languages | 4-5 | 12+ |
| Voice Quality | Good | Excellent |
| Accuracy (Indian accent) | 75-80% | 85-95% |
| Free Tier | Limited | 60 min/month |
| Student Credits | None | $300 |
| Cost (per minute) | $0.024 | $0.024 |
| Setup Complexity | Easy | Medium |

## 🎯 Recommendation

**Use Google Cloud Speech** because:
1. ✅ Better support for Indian languages
2. ✅ $300 free credits with Student Pack
3. ✅ Higher accuracy for Indian accents
4. ✅ Better voice quality
5. ✅ More generous free tier

## 🆘 Troubleshooting

### Error: "Could not load credentials"
```bash
# Check if file exists
ls backend/google-credentials.json

# Check environment variable
echo $GOOGLE_APPLICATION_CREDENTIALS
```

### Error: "API not enabled"
1. Go to Google Cloud Console
2. Enable Speech-to-Text API
3. Enable Text-to-Speech API

### Error: "Quota exceeded"
1. Check usage in Google Cloud Console
2. Verify $300 credits are applied
3. Check free tier limits

## 📚 Resources

- **Google Cloud Console**: https://console.cloud.google.com/
- **Speech-to-Text Docs**: https://cloud.google.com/speech-to-text/docs
- **Text-to-Speech Docs**: https://cloud.google.com/text-to-speech/docs
- **GitHub Student Pack**: https://education.github.com/pack
- **Pricing Calculator**: https://cloud.google.com/products/calculator

---

**Next Steps**: After Bhashini approval, you can add it as a third option for even more language coverage!
