# AI Triage Engine Backend

AWS serverless backend for the DoorStepDoctor AI Triage Engine, providing clinical decision support for ASHA workers and Primary Health Centers in rural India.

## Architecture

```
ASHA Mobile App (React PWA)
        ↓
Amazon API Gateway
        ↓
AWS Lambda (Triage Handler)
        ↓
Amazon Bedrock Knowledge Base (RAG)
        ↓
Claude 3 Haiku (Bedrock)
        ↓
Bedrock Guardrails
        ↓
DynamoDB (Storage)
```

## Technology Stack

- **Runtime**: Node.js 20.x with TypeScript
- **Authentication**: Amazon Cognito
- **API Layer**: Amazon API Gateway
- **Compute**: AWS Lambda (Serverless)
- **AI/ML**: Amazon Bedrock (Claude 3 Haiku)
- **RAG**: Bedrock Knowledge Base + OpenSearch Serverless
- **Voice**: Amazon Transcribe (STT) + Amazon Polly (TTS)
- **Database**: Amazon DynamoDB
- **Monitoring**: Amazon CloudWatch

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── aws.config.ts          # AWS service configuration
│   ├── handlers/
│   │   └── triage.handler.ts      # Main Lambda handler
│   ├── services/
│   │   ├── bedrock.service.ts     # RAG + Claude inference
│   │   ├── dynamodb.service.ts    # Database operations
│   │   ├── voice.service.ts       # Transcribe + Polly
│   │   ├── emergency.service.ts   # Emergency escalation
│   │   └── auth.service.ts        # Cognito authentication
│   ├── types/
│   │   └── triage.types.ts        # TypeScript definitions
│   ├── utils/
│   │   ├── logger.ts              # Structured logging
│   │   └── errors.ts              # Custom error classes
│   └── index.ts                   # Main exports
├── package.json
├── tsconfig.json
└── README.md
```

## Features Implemented

### ✅ Core Services

1. **Bedrock RAG Service** (`bedrock.service.ts`)
   - Knowledge Base retrieval (Top-5 documents)
   - Claude 3 Haiku inference
   - Guardrails enforcement
   - Structured JSON output validation
   - Cost optimization (400 max tokens, 0.2 temperature)

2. **DynamoDB Service** (`dynamodb.service.ts`)
   - Triage record storage with TTL
   - User session management
   - Emergency case logging
   - Analytics event aggregation
   - District health intelligence queries

3. **Voice Service** (`voice.service.ts`)
   - Amazon Transcribe integration (6 Indian languages)
   - Amazon Polly text-to-speech
   - Language detection
   - Audio streaming

4. **Emergency Service** (`emergency.service.ts`)
   - Automatic emergency detection
   - Risk score threshold monitoring
   - Nearest PHC lookup
   - Referral note generation
   - PHC notification system

5. **Authentication Service** (`auth.service.ts`)
   - Cognito user authentication
   - Role-based access control (ASHA/PHC/Admin)
   - Token validation
   - User registration and confirmation

### ✅ Lambda Handlers

1. **Triage Handler** (`triage.handler.ts`)
   - API Gateway integration
   - Request validation (Zod schemas)
   - Complete triage pipeline orchestration
   - Error handling and logging
   - Analytics event tracking

### ✅ Infrastructure

1. **Configuration** (`aws.config.ts`)
   - Environment-based settings
   - Service client initialization
   - Cost tracking configuration
   - Performance targets

2. **Logging** (`logger.ts`)
   - Structured JSON logging
   - CloudWatch integration
   - Performance metrics
   - Cost tracking
   - Emergency event logging

3. **Error Handling** (`errors.ts`)
   - Custom error classes
   - HTTP status code mapping
   - Retryable error detection
   - API error formatting

## Environment Variables

Required environment variables for deployment:

```bash
# AWS Configuration
AWS_REGION=us-east-1

# Amazon Bedrock
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
BEDROCK_KB_ID=your-knowledge-base-id
BEDROCK_GUARDRAIL_ID=your-guardrail-id
BEDROCK_MAX_TOKENS=400
BEDROCK_TEMPERATURE=0.2

# DynamoDB Tables
DYNAMODB_TRIAGE_TABLE=asha-triage-records
DYNAMODB_USER_TABLE=asha-users
DYNAMODB_ANALYTICS_TABLE=asha-analytics
DYNAMODB_EMERGENCY_TABLE=asha-emergency-cases

# Amazon Cognito
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id

# S3 Storage
S3_BUCKET_NAME=asha-triage-storage

# Application Settings
ENVIRONMENT=production
TEST_MODE=false
ENABLE_DETAILED_LOGGING=true
SESSION_TIMEOUT_MINUTES=30

# Emergency Settings
PHC_NOTIFICATION_ENABLED=true
EMERGENCY_CONTACT_NUMBER=108
AUTO_ESCALATION_THRESHOLD=0.8
```

## Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## Deployment

The backend is designed to be deployed as AWS Lambda functions. Use AWS SAM, CloudFormation, or CDK for infrastructure deployment.

```bash
# Deploy using CloudFormation (example)
npm run deploy
```

## API Endpoints

### POST /triage
Process triage request from ASHA worker

**Request:**
```json
{
  "userId": "uuid",
  "symptoms": "Patient has fever and cough for 3 days",
  "language": "hi-IN",
  "patientAge": 35,
  "patientGender": "female",
  "location": {
    "district": "Pune",
    "state": "Maharashtra"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "triageId": "uuid",
    "response": {
      "urgencyLevel": "medium",
      "riskScore": 0.45,
      "recommendedAction": "Monitor symptoms and visit PHC if fever persists",
      "referToPhc": false,
      "confidenceScore": 0.85,
      "citedGuideline": "WHO Rural Triage Protocol"
    }
  }
}
```

## Cost Optimization

- **Target**: ₹1-2 per triage query
- **Claude 3 Haiku**: ~400 tokens per query
- **Serverless**: Near-zero idle cost
- **DynamoDB**: On-demand pricing with TTL
- **Knowledge Base**: Limited document set for prototype

## Performance Targets

- **Response Time**: <2 seconds
- **Uptime**: 99%
- **Concurrent Requests**: 100+
- **JSON Schema Compliance**: 100%

## Security Features

- TLS 1.2+ encryption
- DynamoDB encryption at rest (AES-256)
- IAM least-privilege policies
- Cognito MFA for PHC doctors
- Audit logging with CloudWatch
- PII separation layer

## Monitoring

CloudWatch metrics tracked:
- Lambda execution time
- Bedrock API latency
- Token usage and cost
- Error rates
- Guardrail trigger frequency
- Emergency escalation count

## Next Steps

### Not Yet Implemented:
- [ ] Additional Lambda handlers (auth, voice, emergency)
- [ ] CloudFormation/CDK infrastructure templates
- [ ] Unit and integration tests
- [ ] API Gateway configuration
- [ ] CloudWatch dashboard setup
- [ ] React PWA frontend
- [ ] SMS interface integration
- [ ] QuickSight analytics dashboard

## License

MIT

## Support

For issues and questions, contact the DoorStepDoctor team.
