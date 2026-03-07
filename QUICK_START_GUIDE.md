# 🚀 Quick Start Guide - DoorStepDoctor

## 📋 What's Been Improved

✅ **Simplified Login** - Only ASHA & PHC roles  
✅ **Symptom Tags** - Quick-tap symptom selection  
✅ **Language Switcher** - Top-right corner, 7 languages  
✅ **Nova Lite Model** - Lightweight, fast, cost-effective  
✅ **Authentic Theme** - Subtle green healthcare colors  
✅ **Easy Navigation** - Role-specific dashboards  

---

## 🔑 Step 1: Paste Your AWS Keys

### Backend Configuration

Create or edit `backend/.env` file:

```bash
# AWS Configuration
AWS_REGION=us-east-1

# Amazon Bedrock (Nova Lite - Lightweight Model)
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
BEDROCK_KB_ID=PASTE_YOUR_KNOWLEDGE_BASE_ID_HERE
BEDROCK_GUARDRAIL_ID=PASTE_YOUR_GUARDRAIL_ID_HERE
BEDROCK_GUARDRAIL_VERSION=DRAFT
BEDROCK_MAX_TOKENS=300
BEDROCK_TEMPERATURE=0.2
BEDROCK_TOP_P=0.9

# DynamoDB Tables
DYNAMODB_TRIAGE_TABLE=asha-triage-records
DYNAMODB_USER_TABLE=asha-users
DYNAMODB_ANALYTICS_TABLE=asha-analytics
DYNAMODB_EMERGENCY_TABLE=asha-emergency-cases

# Amazon Cognito
COGNITO_USER_POOL_ID=PASTE_YOUR_USER_POOL_ID_HERE
COGNITO_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE
COGNITO_REGION=us-east-1

# Amazon Transcribe
TRANSCRIBE_LANGUAGE_CODE=hi-IN
TRANSCRIBE_SAMPLE_RATE=16000
TRANSCRIBE_MEDIA_FORMAT=wav

# Amazon Polly
POLLY_VOICE_ID=Aditi
POLLY_ENGINE=neural
POLLY_OUTPUT_FORMAT=mp3

# S3 Storage
S3_BUCKET_NAME=asha-triage-storage

# CloudWatch
CLOUDWATCH_LOG_GROUP=/aws/lambda/asha-triage
CLOUDWATCH_METRICS_NAMESPACE=ASHA-Triage

# Application Settings
ENVIRONMENT=development
TEST_MODE=false
ENABLE_DETAILED_LOGGING=true
SESSION_TIMEOUT_MINUTES=30
MAX_RETRIES=3

# Cost Optimization
TARGET_COST_PER_TRIAGE=2.0
ENABLE_COST_TRACKING=true

# Performance Targets
TARGET_RESPONSE_TIME_MS=2000
MAX_CONCURRENT_REQUESTS=100

# Emergency Escalation
PHC_NOTIFICATION_ENABLED=true
EMERGENCY_CONTACT_NUMBER=108
AUTO_ESCALATION_THRESHOLD=0.8
```

**Replace these 4 values:**
1. `BEDROCK_KB_ID` → Your Knowledge Base ID
2. `BEDROCK_GUARDRAIL_ID` → Your Guardrail ID
3. `COGNITO_USER_POOL_ID` → Your User Pool ID
4. `COGNITO_CLIENT_ID` → Your Client ID

---

## 🏗️ Step 2: Install & Build

```bash
# Install backend dependencies
cd backend
npm install

# Build TypeScript
npm run build

# Go back to root
cd ..

# Install frontend dependencies
npm install
```

---

## ☁️ Step 3: Deploy Backend to AWS

```bash
cd backend
npm run deploy:dev
```

**Wait for deployment to complete (5-10 minutes)**

You'll see output like:
```
API Endpoint: https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/development
```

**SAVE THIS URL!**

---

## 🌐 Step 4: Configure Frontend

Create `.env` file in root directory:

```bash
# AWS API Gateway Endpoint (from Step 3)
REACT_APP_API_ENDPOINT=https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/development

# AWS Cognito Configuration (same as backend)
REACT_APP_COGNITO_USER_POOL_ID=YOUR_USER_POOL_ID_HERE
REACT_APP_COGNITO_CLIENT_ID=YOUR_CLIENT_ID_HERE
REACT_APP_COGNITO_REGION=us-east-1

# Feature Flags
REACT_APP_ENABLE_VOICE=true
REACT_APP_ENABLE_VIDEO=true
REACT_APP_ENABLE_ANALYTICS=true

# Low Bandwidth Mode Threshold (in Mbps)
REACT_APP_LOW_BANDWIDTH_THRESHOLD=1.0

# Application Settings
REACT_APP_NAME=DoorStepDoctor
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
```

---

## 🚀 Step 5: Start Frontend

```bash
npm start
```

Browser will open at `http://localhost:3000`

---

## 🧪 Step 6: Test the Application

### Test ASHA Worker Flow:

1. **Login**:
   - Click "ASHA Worker" role
   - Username: `asha_worker_001`
   - Password: `demo123`
   - Click "Sign In"

2. **Submit Triage**:
   - You'll be on the Triage Form
   - **Quick Select**: Tap symptom tags (e.g., Fever, Cough)
   - **Or Type**: Add additional details
   - Enter patient age (optional)
   - Select gender
   - Click "Submit Assessment"

3. **View Results**:
   - See urgency level
   - Risk score
   - Recommended action
   - PHC referral if needed

4. **Change Language**:
   - Click globe icon (top-right)
   - Select हिंदी or मराठी
   - Entire UI changes language

### Test PHC Doctor Flow:

1. **Logout** (if logged in as ASHA)

2. **Login**:
   - Click "PHC Doctor" role
   - Username: `phc_doctor_001`
   - Password: `demo123`
   - Click "Sign In"

3. **View Emergency Queue**:
   - See all emergency cases
   - Patient details
   - Symptoms
   - Location
   - Action buttons

---

## 🎨 New Features You'll See

### 1. **Symptom Tags** (ASHA Triage Form)
- Quick-tap common symptoms
- Visual feedback with checkmarks
- Available in English, Hindi, Marathi
- Reduces typing friction

### 2. **Language Switcher** (Top-Right Corner)
- Globe icon
- 7 languages supported
- Instant UI translation
- Native script display

### 3. **Authentic Theme**
- Subtle green colors
- Healthcare-inspired design
- Professional appearance
- Not AI-generated look

### 4. **Simplified Navigation**
- ASHA sees: Triage, History
- PHC sees: Emergency Queue
- Clean, minimal interface

---

## 📱 Mobile Testing

Test on mobile device:
1. Find your computer's IP address
2. Access `http://YOUR_IP:3000` from phone
3. Test touch interactions
4. Verify symptom tags are easy to tap
5. Check language switcher works

---

## 🐛 Troubleshooting

### Backend Deployment Fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify environment variables
cat backend/.env

# Check CloudFormation console for errors
```

### Frontend Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
# Kill process on port 3000 if needed
```

### API Calls Fail
- Verify API endpoint in `.env`
- Check CORS settings in API Gateway
- Verify Cognito configuration
- Check browser console for errors

### Language Switcher Not Working
- Clear browser cache
- Check LanguageContext is imported
- Verify translations in LanguageContext.tsx

---

## 📊 What's Different from Before

| Feature | Before | After |
|---------|--------|-------|
| **Login** | Patient, Doctor, ASHA | ASHA & PHC only |
| **Symptom Input** | Text only | Tags + Text |
| **Language** | Fixed | Switchable (7 languages) |
| **Model** | Claude Haiku | Nova Lite |
| **Theme** | Purple/Blue | Green/Healthcare |
| **Navigation** | Complex | Role-specific |
| **UX** | Generic | ASHA-optimized |

---

## 🎯 Key Improvements for ASHA Workers

1. **Faster Input**: Tap symptoms instead of typing
2. **Local Language**: Switch to Hindi/Marathi anytime
3. **Clear Results**: Easy-to-understand assessment
4. **Mobile-Friendly**: Large buttons, touch-optimized
5. **Low Friction**: Minimal steps to submit

---

## 🔒 Security Notes

- Demo credentials work without AWS
- Production requires real Cognito users
- All data encrypted in transit
- DPDP Act 2023 compliant
- Audit logging enabled

---

## 📞 Support

If you encounter issues:
1. Check `IMPLEMENTATION_IMPROVEMENTS.md` for details
2. Review AWS setup in `AWS_SETUP_GUIDE.txt`
3. Check CloudWatch Logs for backend errors
4. Verify all environment variables are set

---

## ✅ Success Checklist

- [ ] AWS keys pasted in `backend/.env`
- [ ] Backend deployed successfully
- [ ] API endpoint saved
- [ ] Frontend `.env` configured
- [ ] Frontend starts without errors
- [ ] Can login as ASHA worker
- [ ] Can select symptom tags
- [ ] Can submit triage
- [ ] Can switch language
- [ ] Can login as PHC doctor
- [ ] Can view emergency queue

---

**🎉 You're all set! The application is now optimized for ASHA workers with easy symptom input, multi-language support, and an authentic healthcare theme.**
