# Deployment Guide - AI Triage Engine

This guide covers deploying the AI Triage Engine backend to AWS using AWS SAM (Serverless Application Model).

## Prerequisites

### 1. Install Required Tools

- **AWS CLI**: [Installation Guide](https://aws.amazon.com/cli/)
- **AWS SAM CLI**: [Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- **Node.js 20.x**: [Download](https://nodejs.org/)
- **TypeScript**: `npm install -g typescript`

### 2. Configure AWS Credentials

```bash
aws configure
```

Provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json)

### 3. Set Up AWS Resources

Before deploying, you need to create:

#### Amazon Cognito User Pool

```bash
# Create user pool
aws cognito-idp create-user-pool \
  --pool-name asha-triage-users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true}" \
  --auto-verified-attributes email \
  --schema Name=email,Required=true Name=phone_number,Required=true \
  --mfa-configuration OPTIONAL

# Create user pool client
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name asha-triage-client \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH
```

#### Amazon Bedrock Knowledge Base

1. Go to AWS Console → Amazon Bedrock → Knowledge Bases
2. Click "Create knowledge base"
3. Configure:
   - Name: `asha-triage-kb`
   - Data source: S3 bucket with medical protocols
   - Embedding model: Titan Embeddings G1 - Text
   - Vector store: OpenSearch Serverless
4. Note the Knowledge Base ID

#### Amazon Bedrock Guardrails (Optional)

1. Go to AWS Console → Amazon Bedrock → Guardrails
2. Click "Create guardrail"
3. Configure content filters:
   - Block medication dosage recommendations
   - Block diagnostic statements
   - Block harmful medical advice
4. Note the Guardrail ID

## Deployment Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Set Environment Variables

```bash
# Required
export BEDROCK_KB_ID="your-knowledge-base-id"
export COGNITO_USER_POOL_ID="your-user-pool-id"
export COGNITO_CLIENT_ID="your-client-id"

# Optional
export BEDROCK_GUARDRAIL_ID="your-guardrail-id"
export S3_BUCKET_NAME="asha-triage-storage"
```

### 4. Deploy to Development

```bash
npm run deploy:dev
```

Or using the deployment script directly:

```bash
bash deploy.sh development
```

### 5. Deploy to Staging/Production

```bash
# Staging
npm run deploy:staging

# Production
npm run deploy:prod
```

## Manual Deployment with SAM CLI

### Validate Template

```bash
sam validate
```

### Build Application

```bash
sam build
```

### Deploy Application

```bash
sam deploy \
  --guided \
  --stack-name asha-triage-dev \
  --parameter-overrides \
    Environment=development \
    BedrockKnowledgeBaseId=$BEDROCK_KB_ID \
    CognitoUserPoolId=$COGNITO_USER_POOL_ID \
    CognitoClientId=$COGNITO_CLIENT_ID
```

## Local Testing

### Start API Locally

```bash
sam local start-api
```

The API will be available at `http://localhost:3000`

### Test Individual Functions

```bash
# Test triage function
sam local invoke TriageFunction --event events/triage-event.json

# Test login function
sam local invoke LoginFunction --event events/login-event.json
```

### Create Test Events

Create `events/triage-event.json`:

```json
{
  "body": "{\"userId\":\"test-user\",\"symptoms\":\"fever and cough\",\"language\":\"hi-IN\",\"timestamp\":\"2024-01-15T10:00:00Z\"}",
  "headers": {
    "Content-Type": "application/json"
  },
  "httpMethod": "POST",
  "path": "/triage"
}
```

## Post-Deployment Configuration

### 1. Upload Medical Documents to Knowledge Base

```bash
# Upload documents to S3
aws s3 cp medical-protocols/ s3://your-kb-bucket/protocols/ --recursive

# Sync Knowledge Base
aws bedrock-agent start-ingestion-job \
  --knowledge-base-id $BEDROCK_KB_ID \
  --data-source-id $DATA_SOURCE_ID
```

### 2. Create Test Users

```bash
# Create ASHA worker
aws cognito-idp admin-create-user \
  --user-pool-id $COGNITO_USER_POOL_ID \
  --username asha_worker_001 \
  --user-attributes \
    Name=email,Value=asha001@example.com \
    Name=phone_number,Value=+919876543210 \
    Name=custom:role,Value=asha_worker \
    Name=custom:district,Value=Pune \
    Name=custom:state,Value=Maharashtra \
  --temporary-password TempPass123!

# Create PHC doctor
aws cognito-idp admin-create-user \
  --user-pool-id $COGNITO_USER_POOL_ID \
  --username phc_doctor_001 \
  --user-attributes \
    Name=email,Value=doctor001@example.com \
    Name=phone_number,Value=+919876543211 \
    Name=custom:role,Value=phc_doctor \
    Name=custom:district,Value=Pune \
    Name=custom:state,Value=Maharashtra \
  --temporary-password TempPass123!
```

### 3. Test API Endpoints

```bash
# Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name asha-triage-dev \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text)

# Test login
curl -X POST ${API_ENDPOINT}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"asha_worker_001","password":"YourPassword123!"}'

# Test triage (with auth token)
curl -X POST ${API_ENDPOINT}/triage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId":"test-user-id",
    "symptoms":"Patient has fever and cough for 3 days",
    "language":"hi-IN",
    "patientAge":35,
    "patientGender":"female",
    "location":{"district":"Pune","state":"Maharashtra"},
    "timestamp":"2024-01-15T10:00:00Z"
  }'
```

## Monitoring and Logs

### View CloudWatch Logs

```bash
# Triage function logs
sam logs --stack-name asha-triage-dev --name TriageFunction --tail

# All function logs
aws logs tail /aws/lambda/asha-triage-dev-triage --follow
```

### View CloudWatch Metrics

```bash
# Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=asha-triage-dev-triage \
  --start-time 2024-01-15T00:00:00Z \
  --end-time 2024-01-15T23:59:59Z \
  --period 3600 \
  --statistics Average
```

### View CloudWatch Alarms

```bash
aws cloudwatch describe-alarms \
  --alarm-name-prefix asha-triage-dev
```

## Cost Optimization

### Monitor Costs

```bash
# Set up billing alerts
aws cloudwatch put-metric-alarm \
  --alarm-name asha-triage-cost-alert-30 \
  --alarm-description "Alert at $30 spend" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 30 \
  --comparison-operator GreaterThanThreshold
```

### Cost Breakdown (Estimated)

- **Lambda**: ~$0.20 per 1M requests
- **DynamoDB**: Pay-per-request (~$1.25 per million writes)
- **Bedrock Claude Haiku**: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- **Transcribe**: ~$0.024 per minute
- **Polly**: ~$4 per 1M characters
- **API Gateway**: ~$3.50 per million requests

**Target**: ₹1-2 per triage query (~$0.012-$0.024)

## Troubleshooting

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Deployment Errors

```bash
# Check CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name asha-triage-dev \
  --max-items 20

# Validate template
sam validate --lint
```

### Permission Errors

Ensure your IAM user/role has:
- Lambda full access
- DynamoDB full access
- API Gateway full access
- CloudFormation full access
- Bedrock invoke model permissions
- Cognito user pool permissions
- S3 bucket access
- CloudWatch Logs access

### Lambda Timeout Issues

Increase timeout in `template.yaml`:

```yaml
Globals:
  Function:
    Timeout: 60  # Increase from 30
```

## Rollback

### Rollback to Previous Version

```bash
aws cloudformation cancel-update-stack --stack-name asha-triage-dev
```

### Delete Stack

```bash
aws cloudformation delete-stack --stack-name asha-triage-dev
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd backend && npm install
      - name: Build
        run: cd backend && npm run build
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy
        run: cd backend && npm run deploy:prod
        env:
          BEDROCK_KB_ID: ${{ secrets.BEDROCK_KB_ID }}
          COGNITO_USER_POOL_ID: ${{ secrets.COGNITO_USER_POOL_ID }}
          COGNITO_CLIENT_ID: ${{ secrets.COGNITO_CLIENT_ID }}
```

## Support

For issues and questions:
- Check CloudWatch Logs
- Review CloudFormation events
- Consult AWS documentation
- Contact the development team

## License

MIT
