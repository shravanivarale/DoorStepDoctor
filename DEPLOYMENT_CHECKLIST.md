# DoorStepDoctor Deployment Checklist

## Pre-Deployment Checklist

### AWS Account Setup
- [ ] AWS account created
- [ ] Billing alerts configured ($30, $60, $90)
- [ ] IAM user created with programmatic access
- [ ] Access keys downloaded and stored securely
- [ ] AWS CLI installed and configured
- [ ] AWS SAM CLI installed
- [ ] Appropriate AWS region selected (ap-south-1 recommended for India)

### AWS Services Configuration

#### Amazon Cognito
- [ ] User Pool created
- [ ] User Pool ID noted
- [ ] App Client created
- [ ] App Client ID noted
- [ ] User attributes configured (role, district, state)
- [ ] Password policies set
- [ ] MFA configured for PHC doctors
- [ ] Test users created (ASHA, PHC, Patient)

#### Amazon Bedrock
- [ ] Bedrock access enabled in AWS account
- [ ] Claude 3 Haiku model access requested and approved
- [ ] Knowledge Base created
- [ ] OpenSearch Serverless collection created
- [ ] Embedding model configured
- [ ] Medical documents uploaded (fever, maternal health, pediatric)
- [ ] Knowledge Base ID noted
- [ ] Test queries validated

#### Bedrock Guardrails (Optional but Recommended)
- [ ] Guardrail created
- [ ] Content filters configured (medication, diagnosis)
- [ ] Guardrail ID noted
- [ ] Test scenarios validated

### Backend Deployment

#### Environment Configuration
- [ ] `backend/.env` file created from `.env.example`
- [ ] All environment variables populated:
  - [ ] AWS_REGION
  - [ ] COGNITO_USER_POOL_ID
  - [ ] COGNITO_CLIENT_ID
  - [ ] BEDROCK_KNOWLEDGE_BASE_ID
  - [ ] BEDROCK_MODEL_ID
  - [ ] BEDROCK_GUARDRAIL_ID (if using)
  - [ ] DYNAMODB_TABLE_PREFIX
  - [ ] LOG_LEVEL

#### Build and Test
- [ ] Dependencies installed: `cd backend && npm install`
- [ ] TypeScript compilation successful: `npm run build`
- [ ] Unit tests passing: `npm test`
- [ ] No TypeScript errors
- [ ] No linting errors

#### SAM Deployment
- [ ] S3 bucket created for SAM artifacts
- [ ] `samconfig.toml` updated with bucket name
- [ ] SAM template validated: `sam validate`
- [ ] SAM build successful: `sam build`
- [ ] SAM deployment successful: `sam deploy`
- [ ] CloudFormation stack created successfully
- [ ] API Gateway endpoint URL noted
- [ ] Lambda functions deployed
- [ ] DynamoDB tables created

#### Post-Deployment Verification
- [ ] API Gateway endpoint accessible
- [ ] Lambda functions showing in AWS Console
- [ ] DynamoDB tables visible
- [ ] CloudWatch log groups created
- [ ] Test API endpoint with curl/Postman
- [ ] Authentication endpoint working
- [ ] Triage endpoint working
- [ ] Voice endpoints working
- [ ] Emergency endpoints working

### Frontend Deployment

#### Environment Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `REACT_APP_API_ENDPOINT` set to deployed API Gateway URL
- [ ] `REACT_APP_AWS_REGION` set correctly
- [ ] `REACT_APP_DEBUG` set to false for production

#### Build and Test
- [ ] Dependencies installed: `npm install`
- [ ] Development server runs: `npm start`
- [ ] Login functionality tested
- [ ] Triage form tested
- [ ] Emergency queue tested
- [ ] Production build successful: `npm run build`
- [ ] Build size optimized (<5MB recommended)

#### Deployment Options

##### Option 1: AWS Amplify (Recommended)
- [ ] Amplify CLI installed
- [ ] Amplify project initialized: `amplify init`
- [ ] Hosting added: `amplify add hosting`
- [ ] Deployed: `amplify publish`
- [ ] Custom domain configured (optional)
- [ ] SSL certificate configured
- [ ] Amplify URL noted

##### Option 2: S3 + CloudFront
- [ ] S3 bucket created for static hosting
- [ ] Bucket policy configured for public read
- [ ] Static website hosting enabled
- [ ] Build files uploaded: `aws s3 sync build/ s3://bucket-name`
- [ ] CloudFront distribution created
- [ ] Origin set to S3 bucket
- [ ] SSL certificate configured
- [ ] Custom domain configured (optional)
- [ ] CloudFront URL noted

### Security Configuration

#### IAM Roles and Policies
- [ ] Lambda execution roles have minimum required permissions
- [ ] DynamoDB access policies configured
- [ ] Bedrock access policies configured
- [ ] Cognito access policies configured
- [ ] S3 access policies configured (if using)
- [ ] CloudWatch Logs policies configured

#### Encryption
- [ ] DynamoDB encryption at rest enabled (AES-256)
- [ ] S3 bucket encryption enabled (if using)
- [ ] KMS keys created and configured
- [ ] TLS 1.2+ enforced for all API calls
- [ ] API Gateway using HTTPS only

#### CORS Configuration
- [ ] API Gateway CORS configured
- [ ] Allowed origins set correctly
- [ ] Allowed headers configured
- [ ] Allowed methods configured
- [ ] Credentials allowed if needed

### Monitoring and Logging

#### CloudWatch
- [ ] Lambda function logs visible
- [ ] API Gateway logs enabled
- [ ] Custom metrics configured
- [ ] Log retention period set (30 days recommended)
- [ ] CloudWatch dashboard created

#### Alarms
- [ ] Lambda error rate alarm configured
- [ ] API Gateway 5xx error alarm configured
- [ ] DynamoDB throttling alarm configured
- [ ] Bedrock API latency alarm configured
- [ ] Cost alarm configured

### Testing

#### End-to-End Testing
- [ ] User registration working
- [ ] User login working
- [ ] ASHA worker can submit triage
- [ ] Triage results displayed correctly
- [ ] Emergency cases appear in PHC queue
- [ ] PHC doctor can update case status
- [ ] Voice input working (if implemented)
- [ ] Multi-language support working
- [ ] Low bandwidth mode working

#### Performance Testing
- [ ] API response time <2 seconds
- [ ] Frontend load time <3 seconds
- [ ] Concurrent user testing (10+ users)
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed

#### Security Testing
- [ ] Authentication required for protected routes
- [ ] Role-based access control working
- [ ] SQL injection testing (N/A for DynamoDB)
- [ ] XSS prevention verified
- [ ] CSRF protection verified
- [ ] API rate limiting tested

### Documentation

#### Technical Documentation
- [ ] API documentation complete
- [ ] Architecture diagrams created
- [ ] Deployment guide updated
- [ ] Environment variables documented
- [ ] Troubleshooting guide created

#### User Documentation
- [ ] ASHA worker user guide created
- [ ] PHC doctor user guide created
- [ ] FAQ document created
- [ ] Video tutorials recorded (optional)
- [ ] Training materials prepared

### Backup and Recovery

#### Backup Strategy
- [ ] DynamoDB point-in-time recovery enabled
- [ ] DynamoDB backup schedule configured
- [ ] S3 versioning enabled (if using)
- [ ] Lambda function code backed up
- [ ] Configuration files backed up

#### Disaster Recovery
- [ ] Recovery procedures documented
- [ ] RTO (Recovery Time Objective) defined
- [ ] RPO (Recovery Point Objective) defined
- [ ] Backup restoration tested
- [ ] Failover procedures documented

### Cost Optimization

#### Resource Optimization
- [ ] Lambda memory settings optimized
- [ ] Lambda timeout settings optimized
- [ ] DynamoDB on-demand pricing configured
- [ ] CloudWatch log retention optimized
- [ ] Unused resources identified and removed

#### Cost Monitoring
- [ ] AWS Cost Explorer enabled
- [ ] Budget alerts configured
- [ ] Cost allocation tags applied
- [ ] Daily cost monitoring set up
- [ ] Cost optimization recommendations reviewed

### Compliance and Legal

#### Data Privacy
- [ ] PII handling procedures documented
- [ ] Data retention policies configured
- [ ] Data anonymization implemented
- [ ] User consent mechanisms in place
- [ ] Privacy policy created

#### Compliance
- [ ] HIPAA compliance reviewed (if applicable)
- [ ] DPDP Act compliance reviewed (India)
- [ ] Audit logging enabled
- [ ] Access logs retained
- [ ] Compliance documentation complete

### Go-Live Preparation

#### Pre-Launch
- [ ] All checklist items completed
- [ ] Stakeholder approval obtained
- [ ] Launch date scheduled
- [ ] Communication plan prepared
- [ ] Support team briefed

#### Launch Day
- [ ] Final deployment to production
- [ ] Smoke tests completed
- [ ] Monitoring dashboards active
- [ ] Support team on standby
- [ ] Rollback plan ready

#### Post-Launch
- [ ] Monitor for 24 hours continuously
- [ ] Check error rates and logs
- [ ] Verify user feedback
- [ ] Address any critical issues immediately
- [ ] Document lessons learned

### Post-Deployment Monitoring (First Week)

#### Daily Checks
- [ ] Check CloudWatch logs for errors
- [ ] Monitor API Gateway metrics
- [ ] Review Lambda function performance
- [ ] Check DynamoDB throttling
- [ ] Monitor Bedrock API usage and costs
- [ ] Review user feedback
- [ ] Check support tickets

#### Weekly Review
- [ ] Performance metrics review
- [ ] Cost analysis
- [ ] User adoption metrics
- [ ] Error rate trends
- [ ] Optimization opportunities identified

### Maintenance Schedule

#### Daily
- [ ] Monitor CloudWatch alarms
- [ ] Check error logs
- [ ] Review critical alerts

#### Weekly
- [ ] Review performance metrics
- [ ] Analyze cost trends
- [ ] Update knowledge base documents
- [ ] Review user feedback

#### Monthly
- [ ] Security patch updates
- [ ] Dependency updates
- [ ] Performance optimization
- [ ] Cost optimization review
- [ ] Backup verification
- [ ] Disaster recovery drill

#### Quarterly
- [ ] Comprehensive security audit
- [ ] Compliance review
- [ ] Architecture review
- [ ] Capacity planning
- [ ] User training refresh

---

## Emergency Contacts

### AWS Support
- Support Plan: [Basic/Developer/Business/Enterprise]
- Support Case URL: https://console.aws.amazon.com/support/

### Team Contacts
- Technical Lead: [Name, Phone, Email]
- DevOps Engineer: [Name, Phone, Email]
- Security Officer: [Name, Phone, Email]
- Product Owner: [Name, Phone, Email]

### Escalation Path
1. On-call engineer
2. Technical lead
3. CTO/Engineering manager
4. AWS support (if needed)

---

## Rollback Procedures

### Backend Rollback
```bash
# Rollback to previous CloudFormation stack
aws cloudformation update-stack \
  --stack-name doorstep-doctor-backend \
  --use-previous-template

# Or delete and redeploy previous version
sam deploy --config-file samconfig.toml.backup
```

### Frontend Rollback
```bash
# Amplify
amplify publish --rollback

# S3 + CloudFront
aws s3 sync backup/ s3://bucket-name --delete
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

### Database Rollback
```bash
# Restore DynamoDB from backup
aws dynamodb restore-table-from-backup \
  --target-table-name TriageMetadata \
  --backup-arn arn:aws:dynamodb:region:account:table/TriageMetadata/backup/backup-id
```

---

## Success Criteria

### Technical Metrics
- [ ] API response time <2 seconds (95th percentile)
- [ ] Error rate <1%
- [ ] Uptime >99%
- [ ] Cost per triage ₹1-2
- [ ] Concurrent users >50

### Business Metrics
- [ ] User registration >100 ASHA workers
- [ ] Daily triage requests >50
- [ ] Emergency detection accuracy >90%
- [ ] User satisfaction >4/5
- [ ] PHC response time <30 minutes

---

## Notes

- Keep this checklist updated as deployment procedures evolve
- Document any deviations from standard procedures
- Share lessons learned with the team
- Update runbooks based on production experience

---

**Deployment Status**: [ ] Not Started | [ ] In Progress | [ ] Completed

**Deployed By**: _______________  
**Deployment Date**: _______________  
**Production URL**: _______________  
**API Endpoint**: _______________
