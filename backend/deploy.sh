#!/bin/bash

# AI Triage Engine Deployment Script
# Deploys the serverless backend to AWS using SAM

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   AI Triage Engine - Deployment Script                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo -e "${RED}Error: AWS SAM CLI is not installed${NC}"
    echo "Please install SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    exit 1
fi

# Get deployment parameters
ENVIRONMENT=${1:-development}
STACK_NAME="asha-triage-${ENVIRONMENT}"
S3_BUCKET=${2:-"asha-triage-deployment-${ENVIRONMENT}"}

echo -e "${YELLOW}Deployment Configuration:${NC}"
echo "  Environment: ${ENVIRONMENT}"
echo "  Stack Name: ${STACK_NAME}"
echo "  S3 Bucket: ${S3_BUCKET}"
echo ""

# Check for required parameters
if [ -z "$BEDROCK_KB_ID" ]; then
    echo -e "${RED}Error: BEDROCK_KB_ID environment variable is required${NC}"
    echo "Please set: export BEDROCK_KB_ID=your-knowledge-base-id"
    exit 1
fi

if [ -z "$COGNITO_USER_POOL_ID" ]; then
    echo -e "${RED}Error: COGNITO_USER_POOL_ID environment variable is required${NC}"
    echo "Please set: export COGNITO_USER_POOL_ID=your-user-pool-id"
    exit 1
fi

if [ -z "$COGNITO_CLIENT_ID" ]; then
    echo -e "${RED}Error: COGNITO_CLIENT_ID environment variable is required${NC}"
    echo "Please set: export COGNITO_CLIENT_ID=your-client-id"
    exit 1
fi

# Build TypeScript
echo -e "${YELLOW}Building TypeScript...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Create S3 bucket if it doesn't exist
echo -e "${YELLOW}Checking S3 bucket...${NC}"
if ! aws s3 ls "s3://${S3_BUCKET}" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "Bucket exists"
else
    echo "Creating S3 bucket: ${S3_BUCKET}"
    aws s3 mb "s3://${S3_BUCKET}"
fi

echo -e "${GREEN}✓ S3 bucket ready${NC}"
echo ""

# Package SAM application
echo -e "${YELLOW}Packaging SAM application...${NC}"
sam package \
    --template-file template.yaml \
    --output-template-file packaged.yaml \
    --s3-bucket "${S3_BUCKET}"

if [ $? -ne 0 ]; then
    echo -e "${RED}Packaging failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Packaging successful${NC}"
echo ""

# Deploy SAM application
echo -e "${YELLOW}Deploying to AWS...${NC}"
sam deploy \
    --template-file packaged.yaml \
    --stack-name "${STACK_NAME}" \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        Environment="${ENVIRONMENT}" \
        BedrockKnowledgeBaseId="${BEDROCK_KB_ID}" \
        BedrockGuardrailId="${BEDROCK_GUARDRAIL_ID:-}" \
        CognitoUserPoolId="${COGNITO_USER_POOL_ID}" \
        CognitoClientId="${COGNITO_CLIENT_ID}" \
        S3BucketName="${S3_BUCKET_NAME:-asha-triage-storage}" \
    --no-fail-on-empty-changeset

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Deployment successful${NC}"
echo ""

# Get API endpoint
echo -e "${YELLOW}Retrieving API endpoint...${NC}"
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
    --output text)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Complete!                                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}API Endpoint:${NC} ${API_ENDPOINT}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test the API: curl ${API_ENDPOINT}/health"
echo "2. Configure frontend with API endpoint"
echo "3. Set up Bedrock Knowledge Base documents"
echo "4. Configure Cognito user pool"
echo ""
