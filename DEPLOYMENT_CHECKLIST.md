# ✅ Deployment Checklist - DoorStepDoctor

## Pre-Deployment Checklist

### 📋 AWS Setup (Manual - Already Completed)
- [x] AWS Account created
- [x] Billing alerts configured ($30, $60, $90)
- [x] IAM user created with appropriate permissions
- [x] AWS CLI installed and configured
- [x] Bedrock model access enabled (Nova Lite)
- [x] S3 bucket created for Knowledge Base
- [x] Knowledge Base created and documents uploaded
- [x] Bedrock Guardrails configured
- [x] Cognito User Pool created
- [x] Cognito App Client created

### 🔑 Keys to Paste
- [ ] Bedrock Knowledge Base ID
- [ ] Bedrock Guardrail ID
- [ ] Cognito User Pool ID
- [ ] Cognito Client ID

---

## Backend Deployment

### 1. Environment Configuration
```bash
cd backend
```

- [ ] Create `.env` file
- [ ] Paste Bedrock Knowledge Base ID
- [ ] Paste Bedrock Guardrail ID
- [ ] Paste Cognito User Pool ID
- [ ] Paste Cognito Client ID
- [ ] Verify all other settings

### 2. Dependencies & Build
```bash
npm install
```
- [ ] Dependencies installed successfully
- [ ] No critical vulnerabilities

```bash
npm run build
```
- [ ] TypeScript compiled successfully
- [ ] `dist/` folder created
- [ ] No build errors

### 3. Deploy to AWS
```bash
npm run deploy:dev
```
- [ ] SAM build completed
- [ ] CloudFormation stack created
- [ ] Lambda functions deployed
- [ ] DynamoDB tables created
- [ ] API Gateway created
- [ ] API Endpoint URL received

**Save API Endpoint:**
```
https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/development
```

### 4. Verify Backend Resources

#### Lambda Functions
- [ ] `asha-triage-dev-triage` - Created
- [ ] `asha-triage-dev-auth` - Created
- [ ] `asha-triage-dev-voice` - Created
- [ ] `asha-triage-dev-emergency` - Created

#### DynamoDB Tables
- [ ] `asha-triage-dev-triage-records` - Created
- [ ] `asha-triage-dev-emergency-cases` - Created
- [ ] `asha-triage-dev-analytics` - Created

#### API Gateway
- [ ] `asha-triage-dev-api` - Created
- [ ] CORS configured
- [ ] Endpoints accessible

---

## Frontend Deployment

### 1. Environment Configuration
```bash
cd ..  # Back to root
```

- [ ] Create `.env` file in root
- [ ] Paste API Endpoint from backend deployment
- [ ] Paste Cognito User Pool ID
- [ ] Paste Cognito Client ID
- [ ] Verify all settings

### 2. Dependencies
```bash
npm install
```
- [ ] Dependencies installed successfully
- [ ] No critical vulnerabilities
- [ ] React scripts available

### 3. Local Testing
```bash
npm start
```
- [ ] Development server starts
- [ ] Opens in browser at `http://localhost:3000`
- [ ] No console errors
- [ ] Login page loads

### 4. Test Core Functionality

#### Login Flow
- [ ] ASHA Worker role button visible
- [ ] PHC Doctor role button visible
- [ ] Can enter username/password
- [ ] Demo credentials work
- [ ] Redirects to correct dashboard

#### ASHA Worker Flow
- [ ] Triage form loads
- [ ] Symptom tags visible
- [ ] Can select multiple tags
- [ ] Tags show checkmarks when selected
- [ ] Can enter additional text
- [ ] Age and gender fields work
- [ ] Submit button enabled when symptoms selected
- [ ] Loading state shows during submission
- [ ] Results display correctly
- [ ] Urgency level shows with correct color
- [ ] Risk score displays
- [ ] Recommended action shows

#### PHC Doctor Flow
- [ ] Emergency queue loads
- [ ] Cases display (if any)
- [ ] Can update case status
- [ ] Refresh button works

#### Language Switcher
- [ ] Globe icon visible in top-right
- [ ] Dropdown opens on click
- [ ] All 7 languages listed
- [ ] Can select different language
- [ ] UI text changes
- [ ] Symptom tags change language

#### Mobile Responsiveness
- [ ] Test on mobile device or browser dev tools
- [ ] Symptom tags are tappable
- [ ] Buttons are large enough
- [ ] Text is readable
- [ ] Navigation works
- [ ] Language switcher accessible

---

## Production Deployment

### 1. Build for Production
```bash
npm run build
```
- [ ] Production build completes
- [ ] `build/` folder created
- [ ] Assets optimized
- [ ] No build warnings

### 2. Deploy to Hosting

#### Option A: AWS Amplify
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```
- [ ] Amplify configured
- [ ] Hosting added
- [ ] Site published
- [ ] URL received

#### Option B: AWS S3 + CloudFront
```bash
# Sync to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```
- [ ] S3 bucket configured
- [ ] Files uploaded
- [ ] CloudFront distribution created
- [ ] SSL certificate configured
- [ ] Custom domain configured (optional)

### 3. Update Environment Variables
- [ ] Change `ENVIRONMENT` to `production`
- [ ] Update API endpoint to production URL
- [ ] Disable test mode
- [ ] Configure production Cognito pool

---

## Post-Deployment Verification

### Backend Health Checks
- [ ] API Gateway responds to requests
- [ ] Lambda functions execute successfully
- [ ] DynamoDB tables accessible
- [ ] Bedrock API calls work
- [ ] Cognito authentication works
- [ ] CloudWatch logs are being created

### Frontend Health Checks
- [ ] Site loads without errors
- [ ] All assets load (CSS, JS, images)
- [ ] Login works
- [ ] Triage submission works
- [ ] Results display correctly
- [ ] Language switching works
- [ ] Mobile view works

### Integration Tests
- [ ] End-to-end triage flow works
- [ ] ASHA can submit assessment
- [ ] PHC can view emergency cases
- [ ] Language changes persist
- [ ] Session management works
- [ ] Logout works

---

## Monitoring Setup

### CloudWatch Alarms
- [ ] Lambda error rate alarm
- [ ] API Gateway 5xx error alarm
- [ ] DynamoDB throttling alarm
- [ ] Bedrock API error alarm
- [ ] Cost alarm ($30, $60, $90)

### CloudWatch Dashboards
- [ ] Lambda execution metrics
- [ ] API Gateway request metrics
- [ ] Bedrock token usage
- [ ] DynamoDB read/write capacity
- [ ] Error rate trends

### Logging
- [ ] Lambda logs in CloudWatch
- [ ] API Gateway access logs
- [ ] Application error logs
- [ ] Audit logs for data access

---

## Security Checklist

### Backend Security
- [ ] IAM roles follow least-privilege
- [ ] API Gateway has authentication
- [ ] DynamoDB encryption at rest enabled
- [ ] S3 buckets are private
- [ ] KMS keys configured
- [ ] Secrets in environment variables (not code)

### Frontend Security
- [ ] HTTPS enabled
- [ ] Content Security Policy configured
- [ ] No sensitive data in client code
- [ ] API keys not exposed
- [ ] CORS properly configured

### Compliance
- [ ] DPDP Act 2023 requirements met
- [ ] Data retention policies configured
- [ ] Audit logging enabled
- [ ] Consent management ready
- [ ] Privacy policy available

---

## Performance Optimization

### Backend
- [ ] Lambda memory optimized
- [ ] DynamoDB auto-scaling enabled
- [ ] API Gateway caching configured
- [ ] Bedrock token limits set
- [ ] Connection pooling enabled

### Frontend
- [ ] Code splitting enabled
- [ ] Assets minified
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Service worker configured

---

## Documentation

- [ ] API documentation complete
- [ ] User guides created
- [ ] Admin documentation available
- [ ] Troubleshooting guide ready
- [ ] Architecture diagrams updated

---

## Training & Rollout

### ASHA Worker Training
- [ ] Training materials prepared
- [ ] Demo accounts created
- [ ] User guide distributed
- [ ] Support contact provided
- [ ] Feedback mechanism established

### PHC Doctor Training
- [ ] Training materials prepared
- [ ] Demo accounts created
- [ ] User guide distributed
- [ ] Support contact provided
- [ ] Feedback mechanism established

---

## Backup & Recovery

- [ ] DynamoDB point-in-time recovery enabled
- [ ] S3 versioning enabled
- [ ] Lambda function versions tagged
- [ ] CloudFormation templates backed up
- [ ] Recovery procedures documented

---

## Cost Optimization

- [ ] Billing alerts configured
- [ ] Cost allocation tags applied
- [ ] Reserved capacity evaluated
- [ ] Unused resources identified
- [ ] Cost optimization recommendations reviewed

**Estimated Monthly Cost:**
- Lambda: $5-10
- DynamoDB: $5-15
- Bedrock (Nova Lite): $10-20
- API Gateway: $3-5
- S3: $1-2
- CloudWatch: $2-5
- **Total: ~$26-57/month** (for moderate usage)

---

## Support & Maintenance

### Monitoring Schedule
- [ ] Daily: Check CloudWatch alarms
- [ ] Weekly: Review error logs
- [ ] Monthly: Analyze usage patterns
- [ ] Quarterly: Security audit

### Update Schedule
- [ ] Weekly: Dependency updates
- [ ] Monthly: Feature updates
- [ ] Quarterly: Major version updates
- [ ] Annually: Security review

---

## Emergency Contacts

**AWS Support:**
- Account ID: _______________
- Support Plan: _______________
- Contact: _______________

**Development Team:**
- Lead: _______________
- Backend: _______________
- Frontend: _______________

**Stakeholders:**
- Project Manager: _______________
- Medical Advisor: _______________
- ASHA Coordinator: _______________

---

## Final Sign-Off

- [ ] All checklist items completed
- [ ] System tested end-to-end
- [ ] Documentation complete
- [ ] Training conducted
- [ ] Support team ready
- [ ] Stakeholders informed

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Approved By:** _______________  

---

## 🎉 Congratulations!

Your DoorStepDoctor application is now live and ready to serve ASHA workers and PHC doctors in rural India!

**Next Steps:**
1. Monitor system performance
2. Collect user feedback
3. Iterate and improve
4. Scale as needed

**Remember:**
- Keep AWS costs monitored
- Respond to alarms promptly
- Update documentation regularly
- Support your users

---

**Status**: Ready for Production ✅  
**Version**: 1.0.0  
**Last Updated**: 2024
