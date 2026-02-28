# DoorStepDoctor Frontend Setup Guide

## Overview

This is the React-based frontend for the DoorStepDoctor AI Triage Engine. It provides interfaces for ASHA workers, PHC doctors, and patients to interact with the AI-powered triage system.

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **3D Graphics**: Three.js (for health dashboard)
- **Styling**: Tailwind CSS (via index.css)
- **Icons**: Lucide React
- **State Management**: React Context API
- **API Client**: Axios

## Prerequisites

- Node.js 16+ and npm
- Backend API deployed and running (see `backend/DEPLOYMENT.md`)
- API Gateway endpoint URL from backend deployment

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and update with your backend API endpoint:

```env
REACT_APP_API_ENDPOINT=https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod
REACT_APP_AWS_REGION=ap-south-1
REACT_APP_DEBUG=false
```

**Important**: Replace `your-api-id` with the actual API Gateway ID from your backend deployment.

### 3. Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

## Application Structure

```
src/
├── components/
│   ├── asha/              # ASHA worker components
│   │   ├── TriageForm.tsx      # Main triage submission form
│   │   └── CaseHistory.tsx     # Past case history
│   ├── phc/               # PHC doctor components
│   │   └── EmergencyQueue.tsx  # Emergency case queue
│   ├── auth/              # Authentication
│   │   └── LoginForm.tsx       # Login/registration
│   ├── dashboard/         # Health dashboards
│   │   └── ThreeJSHealthDashboard.tsx
│   ├── consultation/      # Video consultation
│   │   └── ConsultationRoom.tsx
│   ├── ai-assistant/      # AI voice assistant
│   │   └── VoiceInterface.tsx
│   ├── pharmacy/          # Pharmacy finder
│   │   └── PharmacyFinder.tsx
│   └── low-bandwidth/     # Bandwidth detection
│       └── LowBandwidthDetector.tsx
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── services/
│   ├── api.ts            # API service layer
│   └── types.ts          # TypeScript type definitions
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
└── index.css             # Global styles
```

## User Roles and Features

### ASHA Worker Interface

**Routes**: `/triage`, `/history`

**Features**:
- Submit patient triage requests with symptoms
- Voice input support (6 Indian languages)
- View urgency level and risk scores
- Get recommended actions
- View past case history
- Emergency escalation alerts

**Demo Login**: Use "ASHA" button on login page

### PHC Doctor Interface

**Routes**: `/emergency-queue`

**Features**:
- View emergency cases in real-time
- Update case status (pending → contacted → resolved)
- Access patient demographics and symptoms
- View referral notes and nearest PHC info
- Call PHC directly from interface

**Demo Login**: Use "Doctor" button on login page

### Patient Interface

**Routes**: `/dashboard`, `/consultation`, `/ai-assistant`, `/pharmacy`

**Features**:
- 3D health dashboard visualization
- Video consultation with doctors
- AI voice assistant
- Pharmacy finder
- Low-bandwidth mode support

**Demo Login**: Use "Patient" button on login page

## Key Components

### 1. TriageForm Component

Location: `src/components/asha/TriageForm.tsx`

Main interface for ASHA workers to submit triage requests.

**Features**:
- Patient demographics input (age, gender)
- Multi-language support (7 languages)
- Symptom description (text/voice)
- Real-time triage processing
- Color-coded urgency display
- Risk score visualization
- Recommended actions
- PHC referral alerts

**API Integration**:
```typescript
const result = await apiService.submitTriage({
  userId: user.userId,
  symptoms: symptoms,
  language: 'hi-IN',
  patientAge: 35,
  patientGender: 'female',
  location: { district: 'Pune', state: 'Maharashtra' }
});
```

### 2. EmergencyQueue Component

Location: `src/components/phc/EmergencyQueue.tsx`

Real-time emergency case monitoring for PHC doctors.

**Features**:
- Auto-refresh every 30 seconds
- Color-coded urgency levels
- Case status management
- Patient demographics
- Referral notes
- Nearest PHC information
- Direct call integration

**API Integration**:
```typescript
const cases = await apiService.getEmergencyCases();
await apiService.updateEmergencyStatus(caseId, 'contacted');
```

### 3. CaseHistory Component

Location: `src/components/asha/CaseHistory.tsx`

View past triage cases submitted by ASHA worker.

**Features**:
- Chronological case list
- Detailed case view
- Urgency level filtering
- Risk score history
- Recommended actions archive

### 4. AuthContext

Location: `src/contexts/AuthContext.tsx`

Manages authentication state across the application.

**Features**:
- Login/logout functionality
- User session management
- Role-based access control
- Token storage
- Protected routes

**Usage**:
```typescript
const { user, login, logout, loading } = useAuth();

// Login
await login('asha@demo.com', 'demo123');

// Check user role
if (user?.role === 'asha') {
  // Show ASHA interface
}
```

### 5. API Service

Location: `src/services/api.ts`

Centralized API client for backend communication.

**Available Methods**:
```typescript
// Authentication
apiService.login(email, password)
apiService.register(userData)
apiService.validateToken(token)

// Triage
apiService.submitTriage(request)

// Voice
apiService.speechToText(audioBlob, language)
apiService.textToSpeech(text, language)

// Emergency
apiService.getEmergencyCases()
apiService.updateEmergencyStatus(caseId, status)
apiService.getEmergencyContact(location)
```

## Environment Configuration

### Development

```env
REACT_APP_API_ENDPOINT=http://localhost:3001
REACT_APP_AWS_REGION=ap-south-1
REACT_APP_DEBUG=true
```

### Production

```env
REACT_APP_API_ENDPOINT=https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod
REACT_APP_AWS_REGION=ap-south-1
REACT_APP_DEBUG=false
```

## Building for Production

### 1. Build the Application

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### 2. Test Production Build Locally

```bash
npm install -g serve
serve -s build
```

### 3. Deploy to AWS Amplify (Recommended)

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### 4. Deploy to S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Testing

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

## Troubleshooting

### Issue: API calls failing with CORS errors

**Solution**: Ensure backend API Gateway has CORS enabled:
```yaml
# In backend/template.yaml
Cors:
  AllowOrigin: "'*'"
  AllowHeaders: "'Content-Type,Authorization'"
  AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
```

### Issue: Authentication not working

**Solution**: 
1. Check that backend Cognito User Pool is configured
2. Verify API endpoint in `.env` file
3. Check browser console for error messages
4. Ensure demo users are created in Cognito

### Issue: Voice recording not working

**Solution**:
1. Grant microphone permissions in browser
2. Use HTTPS (required for microphone access)
3. Check browser compatibility (Chrome/Edge recommended)

### Issue: Low bandwidth mode not activating

**Solution**:
1. Check network speed detection in browser DevTools
2. Manually trigger low bandwidth mode
3. Verify LowBandwidthDetector component is mounted

## Performance Optimization

### Code Splitting

The app uses React.lazy() for route-based code splitting:

```typescript
const TriageForm = React.lazy(() => import('./components/asha/TriageForm'));
```

### Image Optimization

- Use WebP format for images
- Implement lazy loading for images
- Compress images before deployment

### API Caching

```typescript
// Cache triage results
const cachedResult = localStorage.getItem(`triage-${caseId}`);
if (cachedResult) {
  return JSON.parse(cachedResult);
}
```

### Bundle Size Analysis

```bash
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

## Security Best Practices

1. **Never commit `.env` file** - Contains sensitive API endpoints
2. **Use HTTPS in production** - Required for secure authentication
3. **Implement rate limiting** - Prevent API abuse
4. **Validate user input** - Sanitize all form inputs
5. **Use Content Security Policy** - Add CSP headers
6. **Enable CORS properly** - Restrict to specific origins in production

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note**: Voice features require modern browser with Web Audio API support.

## Accessibility

The application follows WCAG 2.1 Level AA guidelines:

- Keyboard navigation support
- ARIA labels for screen readers
- Color contrast ratios meet standards
- Focus indicators visible
- Alt text for images

## Multi-Language Support

Supported languages for voice input/output:

1. Hindi (hi-IN)
2. Marathi (mr-IN)
3. Tamil (ta-IN)
4. Telugu (te-IN)
5. Kannada (kn-IN)
6. Bengali (bn-IN)
7. English (en-IN)

## Low-Bandwidth Mode

Automatically activates when network speed < 1 Mbps:

- Disables video features
- Reduces image quality
- Compresses API payloads
- Enables text-only mode
- Caches responses locally

## Next Steps

1. **Connect to Backend**: Update `.env` with deployed API endpoint
2. **Create Test Users**: Add demo users in Cognito User Pool
3. **Test Triage Flow**: Submit test triage requests
4. **Configure Voice**: Test voice input in supported languages
5. **Monitor Performance**: Check CloudWatch logs for errors
6. **Deploy to Production**: Use AWS Amplify or S3+CloudFront

## Support

For issues or questions:
- Check backend logs in CloudWatch
- Review API Gateway logs
- Check browser console for errors
- Verify environment variables
- Test with demo users first

## License

Proprietary - DoorStepDoctor AI Triage Engine
