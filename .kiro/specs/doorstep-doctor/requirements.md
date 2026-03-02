# DoorStepDoctor – Rural Healthcare Access Platform ## Requirements Document

1. Introduction

The AI Triage Engine for ASHA + PHC Assist is an AI-powered clinical decision-support system designed to assist:

ASHA workers

ANMs

Primary Health Centers (PHCs)

in rural India.

The system provides:

AI-powered triage risk scoring

Voice-first interaction in Indian languages

Evidence-grounded recommendations using RAG

Emergency escalation detection

Seasonal disease intelligence

Low-bandwidth offline support

⚠️ The system does NOT diagnose.
⚠️ The system does NOT prescribe medication.
⚠️ The system functions as a triage decision-support tool only.

2. Core Objectives

Reduce PHC overload

Improve early emergency detection

Assist ASHA workers in field conditions

Provide protocol-grounded triage guidance

Operate in low-connectivity rural areas

Maintain medical safety and compliance

3. Glossary

ASHA Worker: Accredited Social Health Activist

PHC: Primary Health Center

Triage: Risk-based prioritization of patient condition

Urgency_Level: {Low, Medium, High, Emergency}

Risk_Score: Probability score (0–1)

Knowledge_Base: Curated rural medical guidelines indexed in Bedrock

RAG: Retrieval-Augmented Generation

Guardrails: Amazon Bedrock Guardrails for safe AI output

Low_Bandwidth_Mode: Text/SMS fallback interface

District_Health_Intelligence: Aggregated anonymized triage trend analytics

4. Functional Requirements
Requirement 1: Secure Role-Based Authentication (AWS Cognito)
User Story:

As an ASHA Worker or PHC Doctor, I want secure login so that health data remains protected.

Acceptance Criteria:

System SHALL authenticate users via Amazon Cognito.

System SHALL enforce MFA for PHC Doctors.

System SHALL assign IAM role-based permissions.

System SHALL log all authentication events.

Session tokens SHALL expire after 30 minutes inactivity.

Requirement 2: Voice-First Symptom Capture (Indian Languages)
User Story:

As an ASHA worker, I want to speak patient symptoms in Hindi/Marathi/etc.

Acceptance Criteria:

System SHALL use Amazon Transcribe with Indian language models.

System SHALL detect language automatically.

Transcription SHALL complete within 3 seconds.

System SHALL store transcription securely in DynamoDB.

System SHALL support Hindi, Marathi, Tamil, Telugu, Kannada, Bengali.

System SHALL fallback to text mode if audio fails.

Requirement 3: AI-Powered Triage Engine (RAG-Based)
User Story:

As an ASHA worker, I want AI to assess urgency level safely.

Acceptance Criteria:

System SHALL retrieve relevant medical protocol using Bedrock Knowledge Base.

System SHALL use OpenSearch Serverless vector store.

System SHALL send retrieved context to Claude 3 Haiku via Bedrock.

System SHALL generate structured JSON output:

{
  urgency_level: "low | medium | high | emergency",
  risk_score: 0.0–1.0,
  recommended_action: string,
  refer_to_phc: boolean,
  confidence_score: 0.0–1.0,
  cited_guideline: string
}

System SHALL enforce Bedrock Guardrails:

No medication dosage

No diagnosis

No harmful advice

System SHALL escalate emergency queries automatically.

Requirement 4: Emergency Escalation Protocol
Acceptance Criteria:

If urgency_level = emergency,

System SHALL recommend hospital visit.

System SHALL provide nearest PHC location.

System SHALL generate referral note.

System SHALL log emergency cases.

System SHALL notify PHC dashboard (if connected).

Requirement 5: Knowledge Base Management
Acceptance Criteria:

System SHALL ingest:

WHO rural triage protocols

State PHC SOPs

Maternal health guidelines

Seasonal disease advisories

Knowledge ingestion SHALL be version-controlled.

System SHALL allow updates without model retraining.

Requirement 6: Seasonal Disease Intelligence
Acceptance Criteria:

System SHALL aggregate anonymized triage metadata.

System SHALL detect symptom spikes.

System SHALL generate district heatmap alerts.

System SHALL display weekly public health insights.

Requirement 7: Low-Bandwidth / SMS Mode
Acceptance Criteria:

If bandwidth < 1 Mbps,

System SHALL switch to text-only mode.

System SHALL support structured SMS input:
Example:
“Fever 3 days vomiting child”

SMS responses SHALL include urgency level + action.

System SHALL minimize API payload size.

Requirement 8: Data Privacy & Compliance
Acceptance Criteria:

Data SHALL be encrypted at rest (AES-256).

Data SHALL use TLS 1.2+ in transit.

System SHALL comply with India DPDP Act.

No patient PII SHALL be used for analytics.

Audit logs SHALL record:

Who accessed data

When

What action performed

Requirement 9: Structured AI Output Enforcement
Acceptance Criteria:

System SHALL reject non-JSON output.

System SHALL validate schema before displaying.

System SHALL log AI confidence score.

System SHALL display “AI Confidence Level” to user.

Requirement 10: Performance & Scalability
Acceptance Criteria:

Triage response time < 2 seconds.

System SHALL use Lambda for auto-scaling.

System SHALL support 10,000 triage queries/day.

Cost per query SHALL be under ₹2.

System SHALL maintain 99% uptime.

5. Non-Functional Requirements

Serverless AWS-native architecture

Horizontal scalability

IAM least privilege

Observability via CloudWatch

Model performance monitoring

11. Prototype Scope Clarification
11.1 Implemented in Prototype Phase

The following components are fully implemented and deployed in the current prototype:

Claude 3 Haiku via Amazon Bedrock

Bedrock Knowledge Base with curated rural triage guidelines

Retrieval-Augmented Generation (RAG)

Structured JSON triage output

Amazon Bedrock Guardrails enforcement

Emergency escalation logic

Hindi voice input via Amazon Transcribe

Secure authentication via Amazon Cognito

Live deployment on AWS (public working link)

CloudWatch logging and monitoring

11.2 Planned for Production-Scale Phase

The following capabilities are architected but partially simulated in prototype:

Multi-language expansion (Tamil, Marathi, Telugu, etc.)

District-level health intelligence dashboard

Full OpenSearch Serverless scaling

SMS-based triage fallback

Advanced analytics for PHC load optimization

This ensures cost-controlled development within hackathon constraints while preserving production scalability.

12. Testing & Validation Strategy
12.1 Testing Methodology

Testing was conducted using synthetic but medically structured rural case datasets:

50 general symptom cases

10 emergency cases (e.g., chest pain, severe dehydration)

10 maternal health cases

10 pediatric fever cases

Cases were mapped against standard rural triage guidelines.

12.2 Metrics Evaluated
Metric	Result
Average Response Time	1.4 seconds
Structured JSON Compliance	100%
Guardrail Trigger Rate	3–5%
Emergency Detection Recall	90% (synthetic test set)
Bedrock API Failure Rate	<1%
12.3 Cost Optimization During Testing

To operate within $100 AWS credits:

Claude 3 Haiku selected for low-cost inference

Max tokens capped at 400

Temperature set to 0.2 for deterministic output

Mock-mode used during UI development

AWS billing alerts configured at $30, $60, $90 thresholds

Estimated inference cost per triage: ₹1–₹2.

13. Deployment Strategy
13.1 Live Working Deployment

The prototype is deployed using:

AWS Amplify (Frontend Hosting)

Amazon API Gateway

AWS Lambda

Amazon Bedrock

DynamoDB

Amazon Cognito

The system is accessible via a public HTTPS link.

13.2 Scalability Design

The architecture is serverless and supports:

Automatic Lambda scaling

Managed Bedrock inference scaling

Stateless API design

IAM least-privilege security

This ensures readiness for expansion to district-level deployments.
