# DoorStepDoctor - Rural Healthcare Access Platform

A comprehensive healthcare platform designed for rural communities in India, featuring AI-powered medical assistance, real-time consultations, and pharmacy integration.

## 🌟 Features

### 🏥 Core Healthcare Services
- **3D Interactive Health Dashboard** - Visualize health metrics with Three.js
- **Real-time Video Consultations** - WebRTC-powered doctor-patient communication
- **AI Medical Assistant** - Voice-first AI guidance in local Indian languages
- **Pharmacy Integration** - Find nearby medical stores and order medicines
- **Medical Records Management** - Secure patient profile and document storage

### 🌐 Accessibility & Optimization
- **Multi-language Support** - Hindi, Marathi, Tamil, Telugu, Bengali, Kannada
- **Low-bandwidth Mode** - Optimized for 2G/3G connections
- **Voice-first Interface** - Accessible for users with limited digital literacy
- **Offline Capabilities** - Essential features work without internet
- **Mobile Responsive** - Works seamlessly on all devices

### 🔒 Security & Privacy
- **End-to-end Encryption** - Secure chat and video communications
- **HIPAA Compliance** - Medical data protection standards
- **Role-based Access Control** - Patient and doctor permission systems
- **Consent Management** - Granular privacy controls
- **AI Safety Disclaimers** - Ethical medical guidance boundaries

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd doorstep-doctor-demo
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Open your browser**
Navigate to `http://localhost:3000`

## 🎮 Demo Usage

### Quick Demo Login
The application includes demo accounts for testing:

- **Demo Patient**: Rajesh Kumar (Rural Village, Maharashtra)
- **Demo Doctor**: Dr. Priya Sharma (General Medicine)

Click the respective demo buttons on the login page for instant access.

### Key Demo Features

#### 1. 3D Health Dashboard
- Interactive heart rate visualization with animated pulse
- Blood pressure gauge with 3D indicators
- Consultation history timeline
- 3D village/hospital map with clickable buildings
- Automatic fallback to text mode in low-bandwidth

#### 2. Video Consultation Room
- WebRTC video/audio calls (requires camera/microphone permissions)
- Real-time chat messaging
- Consultation timer and status tracking
- Doctor-patient communication interface

#### 3. AI Medical Assistant
- Voice input/output (requires microphone permissions)
- Multi-language support simulation
- Medical safety disclaimers
- Emergency detection and doctor referral
- Text-based fallback for low-bandwidth mode

#### 4. Pharmacy Finder
- Location-based pharmacy search
- Medicine availability checking
- Shopping cart and ordering system
- Price comparison across stores
- Order history tracking

#### 5. Low-bandwidth Detection
- Automatic network speed detection
- Manual bandwidth mode switching
- Optimized UI for slow connections
- Connection status monitoring

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Three.js** via React Three Fiber for 3D visualizations
- **React Router** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons

### Key Components
```
src/
├── components/
│   ├── dashboard/ThreeJSHealthDashboard.tsx    # 3D health visualization
│   ├── consultation/ConsultationRoom.tsx       # Video call interface
│   ├── ai-assistant/VoiceInterface.tsx         # AI medical assistant
│   ├── pharmacy/PharmacyFinder.tsx            # Pharmacy integration
│   ├── auth/LoginForm.tsx                     # Authentication
│   └── low-bandwidth/LowBandwidthDetector.tsx # Network optimization
├── App.tsx                                    # Main application
└── index.tsx                                  # Entry point
```

### 3D Visualizations
- **Heart Rate**: Animated pulsing sphere with real-time BPM
- **Blood Pressure**: 3D gauge with systolic/diastolic indicators  
- **Temperature**: Dynamic height-based thermometer
- **Consultations**: 3D block timeline representation
- **Village Map**: Interactive hospital buildings with click handlers

## 🌍 Accessibility Features

### Multi-language Support
- Language selector with native script display
- Voice recognition for Indian languages
- Cultural terminology adaptation
- Right-to-left text support where applicable

### Low-bandwidth Optimizations
- Automatic 2G/3G detection
- Image compression and lazy loading
- Text-first UI fallbacks
- Offline data caching
- Minimal API payloads

### Voice-first Design
- Speech-to-text input
- Text-to-speech output
- Voice navigation commands
- Audio feedback for actions
- Screen reader compatibility

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Firebase Configuration (for production)
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id

# API Endpoints (for production)
REACT_APP_API_BASE_URL=https://api.doorstepdoctor.com
REACT_APP_SOCKET_URL=wss://socket.doorstepdoctor.com

# External Services (for production)
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_key
REACT_APP_SPEECH_API_KEY=your_speech_key
```

### Browser Permissions
The demo requires the following browser permissions for full functionality:
- **Camera**: For video consultations
- **Microphone**: For voice input and audio calls
- **Location**: For pharmacy finder (optional)

## 📱 Mobile Experience

The application is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Swipe gestures for 3D navigation
- Mobile-specific performance optimizations
- Orientation change handling
- Progressive Web App (PWA) ready

## 🔒 Security Features

### Data Protection
- Client-side encryption for sensitive data
- Secure WebRTC connections
- HTTPS-only communication
- Input sanitization and validation

### Privacy Controls
- Granular consent management
- Data anonymization options
- Right to be forgotten compliance
- Audit logging for access tracking

## 🚀 Performance Optimizations

### Code Splitting
- Route-based lazy loading
- Component-level code splitting
- Dynamic imports for heavy features
- Progressive loading strategies

### 3D Optimizations
- Level of Detail (LOD) system
- Automatic quality adjustment
- Frame rate monitoring
- Device capability detection

### Network Optimizations
- Request batching and deduplication
- Smart caching strategies
- CDN integration ready
- Compression middleware

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Coverage report
npm run test:coverage

# E2E tests (if configured)
npm run test:e2e
```

### Test Coverage
The demo includes test-ready components with:
- Unit test structure
- Integration test hooks
- Performance benchmarks
- Accessibility testing

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **AWS S3 + CloudFront**: Scalable CDN
- **Docker**: Containerized deployment

## 📚 Documentation

### API Documentation
- RESTful API endpoints
- WebSocket event specifications
- Authentication flow diagrams
- Database schema definitions

### Component Documentation
- Props and interfaces
- Usage examples
- Accessibility guidelines
- Performance considerations

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Accessibility compliance (WCAG 2.1)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help
- Check the documentation
- Review existing issues
- Create a new issue with detailed description
- Join our community discussions

### Known Issues
- WebRTC requires HTTPS in production
- Some browsers may block microphone access
- 3D features require WebGL support
- Location services need user permission

## 🔮 Future Enhancements

### Planned Features
- Prescription OCR scanning
- Telemedicine integration
- Health insurance connectivity
- Wearable device integration
- Advanced AI diagnostics

### Scalability Improvements
- Microservices architecture
- Real-time analytics
- Multi-tenant support
- Global CDN deployment
- Advanced caching strategies

---

**DoorStepDoctor** - Bringing quality healthcare to rural India through technology innovation. 🏥💙