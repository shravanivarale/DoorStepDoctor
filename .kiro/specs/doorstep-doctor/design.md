# DoorStepDoctor – Rural Healthcare Access Platform ## Design Document


1. High-Level Architecture
ASHA Mobile App (React PWA)
        ↓
Amazon API Gateway
        ↓
AWS Lambda (Triage Handler)
        ↓
Amazon Bedrock Knowledge Base
        ↓
OpenSearch Serverless (Vector Store)
        ↓
Claude 3 Haiku (Bedrock)
        ↓
Bedrock Guardrails
        ↓
Structured JSON Response
        ↓
DynamoDB (Metadata Storage)

Voice Flow:

Voice Input
 → Amazon Transcribe
 → Lambda
 → Bedrock (RAG)
 → Guardrails
 → JSON Output
 → Amazon Polly
 → Voice Response
2. AWS Service Stack

Authentication: Amazon Cognito
API Layer: API Gateway
Compute: AWS Lambda
AI Models: Amazon Bedrock (Claude 3 Haiku)
RAG: Bedrock Knowledge Base + OpenSearch Serverless
Voice STT: Amazon Transcribe
Voice TTS: Amazon Polly
Database: DynamoDB
Storage: S3 (Encrypted)
Monitoring: CloudWatch
Security: IAM + KMS
Analytics: QuickSight (District dashboard)

3. RAG Pipeline

User input received.

Lambda queries Bedrock Knowledge Base.

Top 5 relevant protocol documents retrieved.

Context appended to prompt.

Claude 3 Haiku generates structured JSON.

Guardrails validate response.

JSON schema validated.

Response returned.

4. Prompt Engineering Strategy

System Prompt includes:

No diagnosis rule

No medication rule

Rural simple language rule

Structured JSON rule

Reference citation rule

Temperature = 0.2
Max Tokens = 400

Optimized for safety and determinism.

5. Guardrails Configuration

Block medication dosage

Block harmful instructions

Block self-harm queries

Force safe fallback

Enforce template compliance

6. Cost Model

Claude Haiku:
~400 tokens per query

Estimated:
₹0.8–1.2 per triage

10,000 triages:
₹8,000–12,000

Serverless keeps idle cost minimal.

7. Scalability Strategy

Lambda auto-scales

Bedrock fully managed

OpenSearch serverless

No manual infra provisioning

8. Observability

CloudWatch Metrics:

Latency

Token usage

Error rate

Guardrail triggers

Emergency escalation frequency

9. Data Governance

PII separation layer

Encryption via KMS

Audit logs immutable

Versioned Knowledge Base updates

10. Innovation Layer
District Health Intelligence Engine

Anonymized symptom frequency aggregated.

Detect:

Dengue spikes

Heatstroke clusters

Seasonal fever outbreaks

Displayed via QuickSight dashboard.

11. Prototype-Optimized Architecture

For hackathon cost efficiency:

Knowledge Base uses curated limited documents.

Retrieval depth limited to Top-3 documents.

OpenSearch Serverless configured minimally.

No continuous background analytics jobs running.

This reduces idle cost while preserving full RAG functionality.

12. Testing Mode Architecture

During development:

if TEST_MODE:
    return mocked_structured_json
else:
    call_bedrock()

This approach minimized unnecessary Bedrock API calls during UI and integration testing.

13. Cost Model Breakdown
Per Triage Estimation

Avg input tokens: 400

Avg output tokens: 250

Claude 3 Haiku pricing applied

Estimated cost per triage: $0.001–$0.002
Estimated ₹1–₹2 per consultation.

Monthly Projection (10,000 triages)

₹10,000–₹20,000 estimated inference cost.

Serverless architecture ensures near-zero idle infrastructure cost.

14. Observability & Monitoring

CloudWatch tracks:

API latency

Bedrock invocation time

Token usage

Guardrail triggers

Error rate

Emergency escalation frequency

This ensures measurable reliability.

15. Risk Mitigation Strategy
Hallucination Mitigation

Retrieval-augmented generation (RAG)

Guardrails enforcement

Structured output schema validation

Low temperature configuration

Medical Safety Controls

No diagnosis rule

No medication dosage rule

Escalation to PHC on high-risk cases

Confidence score transparency
