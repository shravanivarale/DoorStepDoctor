# Requirements Document: Privacy, Security, and Ethical Safeguards

## Introduction

This document specifies the requirements for implementing comprehensive privacy, security, and ethical safeguards for the DoorStepDoctor healthcare platform. DoorStepDoctor is an AI-powered clinical decision-support system serving ASHA workers and Primary Health Centers in rural India. The system handles sensitive medical data and must comply with India's DPDP Act 2023 while ensuring patient safety through appropriate AI disclaimers and human oversight mechanisms.

## Glossary

- **System**: The DoorStepDoctor platform including frontend, backend, and AI components
- **ASHA_Worker**: Accredited Social Health Activist who provides primary healthcare services
- **PHC_Doctor**: Primary Health Center doctor who supervises ASHA workers and reviews cases
- **Administrator**: System administrator with elevated privileges for user management
- **Patient**: Individual receiving healthcare services through the platform
- **Medical_Data**: Any health-related information including symptoms, diagnoses, prescriptions, and chat history
- **Consent_Record**: Documented patient permission for specific data processing activities
- **E2E_Encryption**: End-to-end encryption where data is encrypted on sender's device and only decrypted on recipient's device
- **RBAC_System**: Role-Based Access Control system managing permissions based on user roles
- **Data_Principal**: Individual whose personal data is being processed (as per DPDP Act)
- **Data_Fiduciary**: Entity determining purpose and means of processing personal data (as per DPDP Act)
- **Audit_Log**: Immutable record of system actions for compliance and security monitoring
- **AI_Confidence_Score**: Numerical indicator of AI model's certainty in its response
- **Guardrails**: AWS Bedrock safety mechanisms preventing harmful AI outputs

## Requirements

### Requirement 1: End-to-End Encryption for Patient Communications

**User Story:** As a patient, I want my medical conversations with ASHA workers to be end-to-end encrypted, so that only authorized healthcare providers can access my sensitive health information.

#### Acceptance Criteria

1. WHEN a patient initiates a chat session, THE System SHALL generate unique encryption keys for that session
2. WHEN a message is sent, THE System SHALL encrypt the message content on the sender's device before transmission
3. WHEN a message is received, THE System SHALL decrypt the message content only on the authorized recipient's device
4. WHEN storing chat messages, THE System SHALL store only encrypted message content in the database
5. THE System SHALL use industry-standard encryption algorithms (AES-256-GCM or equivalent)
6. WHEN encryption keys are generated, THE System SHALL securely exchange keys using asymmetric encryption (RSA-2048 or equivalent)
7. IF encryption fails, THEN THE System SHALL prevent message transmission and notify the user
8. WHEN a chat session ends, THE System SHALL securely dispose of session encryption keys

### Requirement 2: Role-Based Access Control with Granular Permissions

**User Story:** As a system administrator, I want granular role-based access controls, so that users can only access data and perform actions appropriate to their role.

#### Acceptance Criteria

1. THE System SHALL define distinct roles: ASHA_Worker, PHC_Doctor, Administrator, and Patient
2. WHEN an ASHA_Worker accesses patient data, THE System SHALL restrict access to only patients assigned to that ASHA_Worker
3. WHEN a PHC_Doctor accesses patient data, THE System SHALL allow access to all patients within their assigned PHC jurisdiction
4. WHEN an Administrator performs user management, THE System SHALL require multi-factor authentication
5. THE System SHALL enforce permission checks at both API Gateway and Lambda function levels
6. WHEN a user attempts unauthorized access, THE System SHALL deny the request and log the attempt to Audit_Log
7. THE System SHALL implement least-privilege principle where each role has minimum necessary permissions
8. WHEN role assignments change, THE System SHALL immediately update access permissions without requiring re-authentication

### Requirement 3: Medical Data Protection and DPDP Act Compliance

**User Story:** As a data fiduciary, I want to comply with India's DPDP Act 2023, so that patient data is protected according to legal requirements.

#### Acceptance Criteria

1. THE System SHALL implement data minimization by collecting only necessary Medical_Data for healthcare purposes
2. WHEN Medical_Data is collected, THE System SHALL associate it with a valid Consent_Record
3. THE System SHALL enforce data retention policies where Medical_Data older than 7 years is automatically anonymized
4. WHEN a Data_Principal requests data deletion, THE System SHALL delete or anonymize their data within 30 days
5. THE System SHALL maintain audit trails of all Medical_Data access for minimum 3 years
6. WHEN Medical_Data is anonymized, THE System SHALL remove all personally identifiable information while preserving clinical value
7. THE System SHALL encrypt Medical_Data at rest using AWS KMS with customer-managed keys
8. WHEN Medical_Data is transmitted, THE System SHALL use TLS 1.3 or higher
9. THE System SHALL implement data residency controls ensuring Medical_Data remains within Indian AWS regions

### Requirement 4: Patient Consent Management System

**User Story:** As a patient, I want to provide explicit consent for how my medical data is used, so that I maintain control over my personal health information.

#### Acceptance Criteria

1. WHEN a patient first uses the System, THE System SHALL present a consent form explaining data collection, AI processing, and data sharing practices
2. THE System SHALL require explicit opt-in consent before collecting any Medical_Data
3. WHEN consent is provided, THE System SHALL create a timestamped Consent_Record with specific purposes
4. THE System SHALL allow patients to view their current Consent_Record at any time
5. WHEN a patient withdraws consent, THE System SHALL immediately stop processing their data for withdrawn purposes
6. THE System SHALL provide granular consent options for: data collection, AI-assisted triage, data sharing with PHC_Doctor, and research purposes
7. WHEN consent purposes change, THE System SHALL request renewed consent from affected patients
8. THE System SHALL validate existence of valid Consent_Record before any Medical_Data processing operation
9. WHEN a minor patient is involved, THE System SHALL require guardian consent with additional verification

### Requirement 5: AI Safety Disclaimers and Human Oversight

**User Story:** As an ASHA worker, I want clear AI safety disclaimers and confidence indicators, so that I understand the limitations of AI recommendations and know when to escalate to a doctor.

#### Acceptance Criteria

1. WHEN the System displays AI-generated recommendations, THE System SHALL include a disclaimer stating the AI does not diagnose or prescribe
2. THE System SHALL display an AI_Confidence_Score with each AI recommendation
3. WHEN AI_Confidence_Score is below 70%, THE System SHALL prominently recommend human doctor review
4. THE System SHALL require ASHA_Worker acknowledgment of AI disclaimers before viewing recommendations
5. WHEN critical symptoms are detected, THE System SHALL automatically flag the case for PHC_Doctor review regardless of confidence score
6. THE System SHALL display a persistent visual indicator distinguishing AI-generated content from human-provided content
7. WHEN Guardrails block or modify AI output, THE System SHALL notify the user and log the event
8. THE System SHALL prevent ASHA_Workers from directly sharing AI recommendations with patients without adding their own clinical judgment

### Requirement 6: Enhanced Audit Logging and Monitoring

**User Story:** As a compliance officer, I want comprehensive audit logs of all data access and system actions, so that I can monitor compliance and investigate security incidents.

#### Acceptance Criteria

1. WHEN any Medical_Data is accessed, THE System SHALL log the event with user identity, timestamp, data accessed, and purpose
2. THE System SHALL log all authentication attempts including successes and failures
3. WHEN consent is granted or withdrawn, THE System SHALL create an immutable Audit_Log entry
4. THE System SHALL log all AI model invocations with input sanitization results and output confidence scores
5. WHEN encryption operations fail, THE System SHALL log detailed error information for security analysis
6. THE System SHALL store Audit_Log entries in a separate, tamper-evident storage system
7. WHEN suspicious access patterns are detected, THE System SHALL generate real-time alerts to administrators
8. THE System SHALL retain Audit_Log entries for minimum 7 years in compliance with medical record retention requirements

### Requirement 7: Data Lifecycle Management and Anonymization

**User Story:** As a system administrator, I want automated data lifecycle management, so that old medical data is appropriately retained, anonymized, or deleted according to policy.

#### Acceptance Criteria

1. THE System SHALL classify Medical_Data by retention category: active (0-3 years), archived (3-7 years), anonymized (7+ years)
2. WHEN Medical_Data reaches 3 years old, THE System SHALL automatically move it to archived storage with reduced access permissions
3. WHEN Medical_Data reaches 7 years old, THE System SHALL automatically anonymize it by removing all personally identifiable information
4. THE System SHALL preserve clinical value during anonymization by retaining symptoms, diagnoses, and outcomes in aggregate form
5. WHEN a Data_Principal requests data deletion, THE System SHALL override retention policies and delete data within 30 days
6. THE System SHALL implement soft deletion where deleted records are marked as deleted but retained for 90 days before permanent removal
7. WHEN anonymization occurs, THE System SHALL generate an Audit_Log entry documenting the anonymization process
8. THE System SHALL run data lifecycle processes daily during off-peak hours

### Requirement 8: Secure Key Management and Rotation

**User Story:** As a security engineer, I want secure encryption key management with automatic rotation, so that encryption keys are protected and regularly updated.

#### Acceptance Criteria

1. THE System SHALL use AWS KMS for managing encryption keys with customer-managed keys (CMK)
2. THE System SHALL automatically rotate encryption keys every 90 days
3. WHEN keys are rotated, THE System SHALL re-encrypt data with new keys without service interruption
4. THE System SHALL store E2E_Encryption session keys in memory only and never persist them to disk
5. WHEN a user's device is compromised, THE System SHALL provide a mechanism to revoke and regenerate that user's encryption keys
6. THE System SHALL use separate encryption keys for different data categories (chat messages, medical records, audit logs)
7. WHEN key rotation fails, THE System SHALL alert administrators and retry with exponential backoff
8. THE System SHALL maintain key version history for decrypting historical data

### Requirement 9: Privacy-Preserving Analytics and Reporting

**User Story:** As a public health official, I want to analyze health trends without accessing individual patient data, so that I can make informed policy decisions while respecting patient privacy.

#### Acceptance Criteria

1. THE System SHALL provide aggregate health statistics without exposing individual patient identities
2. WHEN generating reports, THE System SHALL apply k-anonymity with minimum k=5 to prevent re-identification
3. THE System SHALL allow filtering by geographic region, time period, and symptom category
4. WHEN a query would return fewer than 5 patients, THE System SHALL suppress the result to prevent identification
5. THE System SHALL provide differential privacy guarantees for statistical queries with configurable epsilon parameter
6. THE System SHALL log all analytics queries in Audit_Log for compliance monitoring
7. WHEN exporting analytics data, THE System SHALL require Administrator approval and create an audit trail
8. THE System SHALL refresh analytics data daily from anonymized datasets only

### Requirement 10: Incident Response and Breach Notification

**User Story:** As a data protection officer, I want automated incident detection and breach notification workflows, so that we can respond quickly to security incidents and meet legal notification requirements.

#### Acceptance Criteria

1. WHEN a potential security breach is detected, THE System SHALL automatically create an incident ticket and alert the security team
2. THE System SHALL classify incidents by severity: low, medium, high, critical
3. WHEN a high or critical incident occurs, THE System SHALL notify the data protection officer within 1 hour
4. THE System SHALL provide incident response workflows including containment, investigation, and remediation steps
5. WHEN a data breach affects patient data, THE System SHALL generate a list of affected Data_Principals for notification
6. THE System SHALL track incident response timelines to ensure compliance with 72-hour breach notification requirement under DPDP Act
7. WHEN an incident is resolved, THE System SHALL generate a post-incident report documenting root cause and remediation actions
8. THE System SHALL maintain an incident registry for compliance audits and trend analysis

