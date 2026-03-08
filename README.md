# 🏥 DoorStep Doctor - AI-Powered Rural Healthcare Platform

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![AWS](https://img.shields.io/badge/AWS-Serverless-orange.svg)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent healthcare platform designed to bridge the gap between rural communities and quality medical care through AI-powered triage, multilingual support, and real-time emergency response coordination.

## 🌟 Overview

DoorStep Doctor empowers ASHA (Accredited Social Health Activist) workers in rural India with AI-driven decision support for medical triage, emergency case management, and seamless coordination with Primary Health Centers (PHCs). The platform leverages Amazon Bedrock's generative AI capabilities to provide accurate, context-aware medical guidance in local languages.

## ✨ Key Features

### 🤖 AI-Powered Triage Engine
- **Intelligent Symptom Analysis**: Uses Amazon Nova Lite model for rapid, accurate medical assessment
- **RAG-Enhanced Knowledge Base**: 18 comprehensive medical protocols covering common rural emergencies
- **Confidence Scoring**: Provides reliability metrics for each triage recommendation
- **Multilingual Support**: Hindi, English, and regional language interfaces

### 🚨 Emergency Response System
- **Real-Time Case Management**: Automatic escalation of critical cases to nearest PHCs
- **Geolocation-Based Routing**: Intelligent PHC selection based on distance and availability
- **SMS Notifications**: Automated alerts to PHC doctors for emergency cases
- **Status Tracking**: Real-time updates on case acknowledgment and response

### 🎙️ Voice Interface
- **Speech-to-Text**: Amazon Transcribe integration for voice-based symptom input
- **Text-to-Speech**: Amazon Polly for audio guidance in local languages
- **Low-Bandwidth Optimization**: Adaptive quality for rural connectivity

### 📊 Analytics & Monitoring
- **Real-Time Dashboards**: 3D visualizations of health metrics and trends
- **District-Level Insights**: Aggregated data for public health planning
- **Performance Metrics**: Response times, case volumes, and outcome tracking

### 🔐 Security & Compliance
- **HIPAA-Aligned Architecture**: End-to-end encryption and secure data handling
- **Role-Based Access Control**: Separate interfaces for ASHA workers, PHC doctors, and administrators
- **Audit Logging**: Comprehensive tracking of all medical interactions
- **Data Retention Policies**: Automated cleanup of sensitive audio recordings

## 🏗️ Architecture

### Frontend Stack
```
React 18.x + TypeScript
├── UI Framework: Material-UI / Tailwind CSS
├── State Management: React Context API
├── Routing: React Router v6
├── 3D Visualization: Three.js
├── Real-Time Updates: WebSocket connections
└── PWA Support: Service Workers for offline capability
```

### Backend Stack
```
AWS Serverless Architecture
├── Compute: AWS Lambda (Node.js 20.x, ARM64)
├── API: Amazon API Gateway (REST)
├── AI/ML: Amazon Bedrock (Nova Lite model)
├── Knowledge Base: Amazon Bedrock Knowledge Base + OpenSearch
├── Database: Amazon DynamoDB (5 tables)
├── Storage: Amazon S3 (encrypted)
├── Voice: Amazon Transcribe + Polly
├── Notifications: Amazon SNS
├── Authentication: Amazon Cognito
├── Monitoring: CloudWatch + X-Ray
└── IaC: AWS SAM (CloudFormation)
```

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  ASHA    │  │   PHC    │  │  Admin   │  │  Voice   │       │
│  │Interface │  │Dashboard │  │  Panel   │  │Interface │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/WSS
┌────────────────────────▼────────────────────────────────────────┐
│                   API Gateway + Cognito Auth                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
│   Triage     │  │  Emergency  │  │   Voice    │
│   Lambda     │  │   Lambda    │  │   Lambda   │
└───────┬──────┘  └──────┬──────┘  └─────┬──────┘
        │                │                │
        │         ┌──────▼──────┐         │
        │         │  DynamoDB   │         │
        │         │  (5 Tables) │         │
        │         └─────────────┘         │
        │                                 │
┌───────▼─────────────────────────────────▼──────┐
│           Amazon Bedrock Services               │
│  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Nova Lite   │  │   Knowledge Base       │ │
│  │    Model     │  │  (18 Protocols + RAG)  │ │
│  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## 📋 Prerequisites

### Development Environment
- Node.js 20.x or higher
- npm 9.x or higher
- AWS CLI v2
- AWS SAM CLI 1.x
- Git

### AWS Account Requirements
- Active AWS account with appropriate permissions
- Amazon Bedrock access (Nova Lite model enabled)
- Cognito User Pool configured
- S3 bucket for knowledge base storage

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/shravanivarale/DoorStepDoctor.git
cd DoorStepDoctor
```

### 2. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables

**Frontend (.env.local)**
```env
REACT_APP_API_ENDPOINT=https://your-api-gateway-url.execute-api.ap-south-1.amazonaws.com/development
REACT_APP_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
REACT_APP_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_COGNITO_REGION=ap-south-1
```

**Backend (backend/.env)**
```env
AWS_REGION=ap-south-1
BEDROCK_KB_ID=your-knowledge-base-id
BEDROCK_GUARDRAIL_ID=your-guardrail-id
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
DYNAMODB_TRIAGE_TABLE=asha-triage-records
DYNAMODB_EMERGENCY_TABLE=asha-emergency-cases
```

### 4. Deploy Backend
```bash
cd backend
sam build
sam deploy --guided
```

### 5. Run Frontend
```bash
npm start
```

Application will be available at `http://localhost:3000`

## 📚 Knowledge Base

The platform includes 18 comprehensive medical protocols:

### Emergency Protocols
- Burns Management
- Cardiac Chest Pain
- Trauma & Injuries
- Poisoning Management
- Snake Bite Management
- Severe Allergic Reactions

### Maternal & Child Health
- Maternal Bleeding
- Obstetric Eclampsia
- Labor Complications
- Neonatal Sepsis
- Pediatric Diarrhea
- Severe Malnutrition

### Common Conditions
- Fever Guidelines
- Respiratory Distress
- Seizures & Convulsions
- Triage Classification
- Vital Signs Reference

## 🔧 Configuration

### DynamoDB Tables
1. **asha-triage-records**: Stores all triage assessments
2. **asha-emergency-cases**: Tracks emergency escalations
3. **asha-analytics**: Aggregated health metrics
4. **asha-users**: User profiles and preferences
5. **asha-response-cache**: Semantic caching for AI responses

### Lambda Functions
- **TriageFunction**: Main AI triage processing (384MB, 30s timeout)
- **EmergencyFunction**: Emergency case management
- **VoiceSTTFunction**: Speech-to-text conversion (60s timeout)
- **VoiceTTSFunction**: Text-to-speech synthesis
- **EscalationCheckerFunction**: Automated emergency escalation (runs every 2 min)
- **KBWarmingFunction**: Knowledge base warm-up (runs every 4 hours)

### API Endpoints
```
POST   /auth/login              - User authentication
POST   /auth/register           - User registration
POST   /triage                  - AI triage assessment
GET    /emergency/cases         - List emergency cases
POST   /emergency/accept        - PHC doctor acknowledgment
POST   /voice/stt               - Speech-to-text conversion
POST   /voice/tts               - Text-to-speech synthesis
GET    /analytics               - Health metrics dashboard
```

## 🧪 Testing

### Run Unit Tests
```bash
# Frontend
npm test

# Backend
cd backend
npm test
```

### Run Integration Tests
```bash
npm run test:integration
```

### Test Coverage
```bash
npm run test:coverage
```

## 📊 Performance Metrics

### Target Metrics
- **Triage Response Time**: < 2 seconds
- **API Latency (P95)**: < 500ms
- **Knowledge Base Retrieval**: < 300ms
- **Voice Processing**: < 5 seconds
- **Emergency Escalation**: < 30 seconds

### Cost Optimization
- **Semantic Caching**: 40% reduction in Bedrock API calls
- **ARM64 Lambda**: 20% cost savings vs x86
- **DynamoDB On-Demand**: Pay-per-request pricing
- **S3 Lifecycle**: Auto-delete audio after 24 hours

## 🔒 Security Features

- **Encryption at Rest**: All DynamoDB tables and S3 buckets
- **Encryption in Transit**: TLS 1.2+ for all API calls
- **IAM Least Privilege**: Function-specific roles with minimal permissions
- **Bedrock Guardrails**: Content filtering and PII detection
- **API Rate Limiting**: 1000 req/sec burst, 500 req/sec sustained
- **CORS Configuration**: Restricted to approved origins
- **Audit Logging**: CloudWatch Logs with 30-day retention

## 📈 Monitoring & Alerts

### CloudWatch Alarms
- **High Error Rate**: > 10 errors in 5 minutes
- **High Latency**: > 2 seconds average
- **RAG Zero Results**: > 5 occurrences in 10 minutes
- **Low Confidence Triage**: > 10 cases in 30 minutes
- **DLQ Depth**: > 10 messages in analytics queue

### Metrics Dashboard
- Request volume and error rates
- Latency percentiles (P50, P95, P99)
- Bedrock token usage and costs
- DynamoDB read/write capacity
- Lambda concurrent executions

## 🌍 Deployment

### Production Deployment
```bash
# Build optimized frontend
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to AWS Amplify
amplify publish
```

### Backend Deployment
```bash
cd backend
sam build --use-container
sam deploy --config-env production
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Team

- **Project Lead**: Shravani Varale
- **Architecture**: AI-Powered Healthcare Solutions
- **Technology Stack**: AWS Serverless + React + Amazon Bedrock

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues**: [Create an issue](https://github.com/shravanivarale/DoorStepDoctor/issues)
- **Email**: support@doorstepdoctor.com
- **Documentation**: [Full Documentation](https://docs.doorstepdoctor.com)

## 🙏 Acknowledgments

- Amazon Web Services for Bedrock and serverless infrastructure
- ASHA workers across India for their invaluable feedback
- Open-source community for amazing tools and libraries

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ AI-powered triage system
- ✅ Emergency escalation
- ✅ Voice interface
- ✅ Multilingual support

### Phase 2 (Q2 2026)
- 🔄 Mobile app (React Native)
- 🔄 Offline mode with sync
- 🔄 Telemedicine integration
- 🔄 Prescription management

### Phase 3 (Q3 2026)
- 📅 Predictive analytics
- 📅 Community health tracking
- 📅 Integration with national health systems
- 📅 Advanced ML models for diagnosis

---

**Built with ❤️ for rural healthcare in India**
