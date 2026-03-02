# DoorStepDoctor - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you run the DoorStepDoctor application locally for development and testing.

## Prerequisites

- Node.js 18+ and npm
- AWS Account (for backend deployment)
- Git

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd DoorStepDoctor_shravani

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## Step 2: Configure Environment

### Frontend Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
# For local development, you can use mock values:
REACT_APP_API_ENDPOINT=http://localhost:3001
REACT_APP_COGNITO_USER_POOL_ID=mock-pool-id
REACT_APP_COGNITO_CLIENT_ID=mock-client-id
REACT_APP_COGNITO_REGION=ap-south-1
```

### Backend Configuration

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your AWS credentials
# See AWS_SETUP_GUIDE.txt for detailed instructions
```

## Step 3: Run Development Servers

### Option A: Frontend Only (with Mock Backend)

```bash
# Start frontend development server
npm start

# Open http://localhost:3000
```

The frontend includes demo authentication that works without a backend:
- ASHA Worker: username `asha1`, password `demo123`
- PHC Doctor: username `phc1`, password `demo123`

### Option B: Full Stack (Frontend + Backend)

#### Terminal 1: Start Backend (Local)

```bash
cd backend

# Run backend locally using SAM
sam local start-api --port 3001

# Backend will be available at http://localhost:3001
```

#### Terminal 2: Start Frontend

```bash
# From project root
npm start

# Frontend will be available at http://localhost:3000
```

## Step 4: Test the Application

### 1. Login

- Open http://localhost:3000
- Click "Login"
- Use demo credentials:
  - ASHA Worker: `asha1` / `demo123`
  - PHC Doctor: `phc1` / `demo123`

### 2. Submit a Triage Request (ASHA Worker)

1. Navigate to "Triage" page
2. Fill in patient details:
   - Age: 35
   - Gender: Female
   - Symptoms: "Patient has fever for 3 days, headache, and body pain"
3. Click "Submit Triage Request"
4. View the AI-generated triage result

### 3. Test Voice Recording

1. On the Triage page, click the microphone icon
2. Allow microphone permissions
3. Speak the symptoms clearly
4. Click the microphone again to stop
5. The transcribed text will appear in the symptoms field

### 4. View Emergency Queue (PHC Doctor)

1. Login as PHC doctor
2. Navigate to "Emergency Queue"
3. View pending emergency cases
4. Update case status

## Project Structure

```
DoorStepDoctor_shravani/
├── backend/                 # AWS Lambda backend
│   ├── src/
│   │   ├── handlers/       # Lambda function handlers
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilities
│   ├── knowledge-base/     # Medical protocols
│   ├── template.yaml       # AWS SAM template
│   └── package.json
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── asha/          # ASHA worker components
│   │   ├── phc/           # PHC doctor components
│   │   ├── auth/          # Authentication
│   │   └── ai-assistant/  # Voice interface
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   └── App.tsx            # Main app component
├── public/                # Static assets
└── package.json           # Frontend dependencies
```

## Available Scripts

### Frontend

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Lint code
```

### Backend

```bash
cd backend
npm run build      # Compile TypeScript
npm test           # Run unit tests
npm run deploy:dev # Deploy to AWS dev environment
sam local start-api # Run locally
```

## Features to Test

### ✅ Implemented Features

1. **Authentication System**
   - Login/logout
   - Role-based access (ASHA/PHC)
   - Session management

2. **Triage System**
   - Symptom input (text)
   - Voice recording (Web Audio API)
   - AI-powered triage assessment
   - Risk scoring
   - Emergency detection

3. **Voice Interface**
   - Speech-to-text (microphone recording)
   - Text-to-speech (audio playback)
   - Multi-language support (7 languages)

4. **Emergency Management**
   - Automatic emergency detection
   - PHC notification
   - Emergency queue dashboard
   - Case status tracking

5. **Case History**
   - View past triage cases
   - Filter by date/urgency
   - Export functionality

### ⏳ Pending Features (Require AWS Setup)

1. **Bedrock Integration**
   - Requires AWS Bedrock Knowledge Base
   - Requires Claude 3 Haiku model access

2. **Real Voice Services**
   - Requires Amazon Transcribe
   - Requires Amazon Polly

3. **Production Database**
   - Requires DynamoDB tables

## Development Tips

### 1. Hot Reload

Both frontend and backend support hot reload:
- Frontend: Changes auto-refresh in browser
- Backend: Restart `sam local start-api` after code changes

### 2. Debug Mode

Enable debug logging:

```bash
# Frontend
REACT_APP_DEBUG=true npm start

# Backend
DEBUG=* sam local start-api
```

### 3. Mock Data

The application includes mock data for development:
- Mock users in `src/contexts/AuthContext.tsx`
- Mock triage responses in `src/services/api.ts`

### 4. Browser DevTools

- React DevTools: Inspect component state
- Network tab: Monitor API calls
- Console: View logs and errors

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm start
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Microphone Not Working

1. Ensure HTTPS (or localhost)
2. Check browser permissions
3. Use Chrome/Edge for best support

### Backend Connection Failed

1. Verify backend is running on port 3001
2. Check CORS configuration
3. Verify API endpoint in `.env.local`

## Next Steps

### For Development

1. ✅ Run locally and test features
2. ⏳ Set up AWS account (see AWS_SETUP_GUIDE.txt)
3. ⏳ Deploy backend to AWS
4. ⏳ Configure Cognito User Pool
5. ⏳ Set up Bedrock Knowledge Base
6. ⏳ Deploy frontend to Amplify

### For Production

1. ⏳ Complete AWS infrastructure setup
2. ⏳ Deploy backend (see backend/DEPLOYMENT.md)
3. ⏳ Deploy frontend (see FRONTEND_DEPLOYMENT.md)
4. ⏳ Configure custom domain
5. ⏳ Set up monitoring and alerts
6. ⏳ User acceptance testing

## Documentation

- **AWS Setup**: `AWS_SETUP_GUIDE.txt`
- **Backend Deployment**: `backend/DEPLOYMENT.md`
- **Frontend Deployment**: `FRONTEND_DEPLOYMENT.md`
- **API Documentation**: `backend/README.md`
- **Architecture**: `.kiro/specs/doorstep-doctor/design.md`
- **Requirements**: `.kiro/specs/doorstep-doctor/requirements.md`
- **Tasks**: `.kiro/specs/doorstep-doctor/tasks.md`

## Support

For issues or questions:
1. Check documentation files
2. Review browser console for errors
3. Check backend logs
4. Verify environment variables
5. Test with demo credentials first

## Demo Credentials

### ASHA Worker
- Username: `asha1`
- Password: `demo123`
- Role: ASHA Worker
- District: Mumbai
- State: Maharashtra

### PHC Doctor
- Username: `phc1`
- Password: `demo123`
- Role: PHC Doctor
- District: Mumbai
- State: Maharashtra

---

**Status**: Ready for local development ✅

**Last Updated**: March 2026

**Version**: 1.0.0
