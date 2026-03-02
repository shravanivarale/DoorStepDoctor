# Next Steps After AWS Setup Complete ✅

## Congratulations! 🎉

You've completed the AWS infrastructure setup through Step 15. Your AWS resources are configured:

- ✅ AWS Account & IAM User
- ✅ AWS CLI & SAM CLI installed
- ✅ Amazon Bedrock enabled (Claude 3 Haiku)
- ✅ S3 Bucket with medical protocols
- ✅ Bedrock Knowledge Base created
- ✅ Bedrock Guardrails configured
- ✅ Cognito User Pool created
- ✅ Environment variables configured (.env file)

---

## What's Next: Deploy the Backend

You're now at **PART 6: DEPLOY THE BACKEND** in the AWS setup guide.

### Step 16: Install Project Dependencies

1. Open Command Prompt or PowerShell

2. Navigate to the backend folder:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```
   
   This will take 2-3 minutes. Wait for it to complete.

---

### Step 17: Build the TypeScript Code

1. In the same terminal, run:
   ```bash
   npm run build
   ```

2. Wait for build to complete (30 seconds)

3. You should see a new `dist` folder created in the backend directory

4. Verify no errors in the output

---

### Step 18: Deploy to AWS

This is the big step! This will deploy your entire backend to AWS.

1. In the same terminal, run:
   ```bash
   npm run deploy:dev
   ```

2. The deployment process will:
   - Package your code
   - Upload to AWS
   - Create Lambda functions (6 functions)
   - Create DynamoDB tables (4 tables)
   - Create API Gateway
   - Set up CloudWatch monitoring

3. This will take **5-10 minutes**

4. Watch for any errors in the output

5. When complete, you'll see output like:
   ```
   Successfully created/updated stack - asha-triage-dev
   
   CloudFormation outputs from deployed stack
   -----------------------------------------------
   Outputs
   -----------------------------------------------
   Key                 ApiEndpoint
   Description         API Gateway endpoint URL
   Value               https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/development
   -----------------------------------------------
   ```

6. **CRITICAL**: Copy and save the API Endpoint URL!
   
   You'll need this for the frontend configuration.

---

## After Deployment: Create Test Users

### Step 19: Create ASHA Worker Test User

Run this command (replace `YOUR_USER_POOL_ID` with your actual User Pool ID from Step 14):

```bash
aws cognito-idp admin-create-user --user-pool-id YOUR_USER_POOL_ID --username asha_worker_001 --user-attributes Name=email,Value=asha001@example.com Name=phone_number,Value=+919876543210 Name=custom:role,Value=asha_worker Name=custom:district,Value=Pune Name=custom:state,Value=Maharashtra --temporary-password TempPass123!
```

Save the credentials:
- Username: `asha_worker_001`
- Temporary Password: `TempPass123!`
- Email: `asha001@example.com`

### Step 20: Create PHC Doctor Test User

Run this command:

```bash
aws cognito-idp admin-create-user --user-pool-id YOUR_USER_POOL_ID --username phc_doctor_001 --user-attributes Name=email,Value=doctor001@example.com Name=phone_number,Value=+919876543211 Name=custom:role,Value=phc_doctor Name=custom:district,Value=Pune Name=custom:state,Value=Maharashtra --temporary-password TempPass123!
```

Save the credentials:
- Username: `phc_doctor_001`
- Temporary Password: `TempPass123!`
- Email: `doctor001@example.com`

### Step 21: Set Permanent Passwords

For ASHA worker:
```bash
aws cognito-idp admin-set-user-password --user-pool-id YOUR_USER_POOL_ID --username asha_worker_001 --password YourNewPassword123! --permanent
```

For PHC doctor:
```bash
aws cognito-idp admin-set-user-password --user-pool-id YOUR_USER_POOL_ID --username phc_doctor_001 --password YourNewPassword123! --permanent
```

---

## Test Your Deployment

### Step 22: Test Authentication Endpoint

1. Set your API endpoint as a variable:
   ```bash
   set API_ENDPOINT=https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/development
   ```

2. Test login:
   ```bash
   curl -X POST %API_ENDPOINT%/auth/login -H "Content-Type: application/json" -d "{\"username\":\"asha_worker_001\",\"password\":\"YourNewPassword123!\"}"
   ```

3. You should see a JSON response with a token

### Step 23: Test Triage Endpoint

1. Create a file `test-triage.json` in the backend folder:
   ```json
   {
     "userId": "test-user-123",
     "symptoms": "Patient has fever and cough for 3 days",
     "language": "hi-IN",
     "patientAge": 35,
     "patientGender": "female",
     "location": {
       "district": "Pune",
       "state": "Maharashtra"
     },
     "timestamp": "2024-01-15T10:00:00Z"
   }
   ```

2. Test the triage endpoint:
   ```bash
   curl -X POST %API_ENDPOINT%/triage -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN_HERE" -d @test-triage.json
   ```

3. You should see a JSON response with triage results!

---

## Update Frontend Configuration

Once your backend is deployed, update the frontend to use your API endpoint:

1. Open `.env.local` in the project root

2. Update the API endpoint:
   ```env
   REACT_APP_API_ENDPOINT=https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/development
   ```
   
   Replace with your actual API Gateway endpoint from Step 18.

3. Save the file

4. Restart the frontend dev server:
   ```bash
   npm start
   ```

---

## Verify AWS Resources

### Step 24: Check Created Resources

1. **Lambda Functions** (should see 6):
   - asha-triage-dev-triage
   - asha-triage-dev-login
   - asha-triage-dev-register
   - asha-triage-dev-voice-stt
   - asha-triage-dev-voice-tts
   - asha-triage-dev-emergency

2. **DynamoDB Tables** (should see 4):
   - asha-triage-dev-triage-records
   - asha-triage-dev-emergency-cases
   - asha-triage-dev-analytics
   - asha-triage-dev-users

3. **API Gateway**:
   - asha-triage-dev-api

4. **CloudWatch Logs**:
   - Log groups for each Lambda function

---

## Quick Command Reference

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to AWS
npm run deploy:dev

# Create test user
aws cognito-idp admin-create-user --user-pool-id YOUR_POOL_ID --username asha_worker_001 --user-attributes Name=email,Value=asha001@example.com Name=custom:role,Value=asha_worker --temporary-password TempPass123!

# Set permanent password
aws cognito-idp admin-set-user-password --user-pool-id YOUR_POOL_ID --username asha_worker_001 --password YourPassword123! --permanent

# Test API
curl -X POST https://YOUR_API_ENDPOINT/auth/login -H "Content-Type: application/json" -d "{\"username\":\"asha_worker_001\",\"password\":\"YourPassword123!\"}"
```

---

## Troubleshooting

### Deployment Fails

1. Check AWS CLI is configured:
   ```bash
   aws sts get-caller-identity
   ```

2. Verify environment variables in `.env` file

3. Check CloudFormation console for detailed errors

4. Review backend/DEPLOYMENT.md for more help

### API Returns Errors

1. Check CloudWatch Logs for Lambda functions
2. Verify Cognito user pool is configured correctly
3. Ensure Knowledge Base has documents synced
4. Check API Gateway configuration

### Authentication Fails

1. Verify User Pool ID and Client ID are correct
2. Check user exists in Cognito
3. Ensure password meets requirements
4. Try resetting user password

---

## Cost Monitoring

After deployment, monitor your AWS costs:

1. Go to AWS Console → Billing Dashboard
2. Check "Cost Explorer"
3. Review daily costs
4. Ensure you're within free tier limits

Expected costs (if within free tier):
- Lambda: Free (1M requests/month)
- DynamoDB: Free (25GB storage)
- API Gateway: Free (1M requests/month)
- Bedrock: ~$0.00025 per request (Claude 3 Haiku)

---

## Summary

**Current Status:** AWS infrastructure setup complete ✅

**Next Steps:**
1. ⏭️ Step 16: Install backend dependencies (`npm install`)
2. ⏭️ Step 17: Build TypeScript (`npm run build`)
3. ⏭️ Step 18: Deploy to AWS (`npm run deploy:dev`)
4. ⏭️ Step 19-21: Create test users
5. ⏭️ Step 22-23: Test API endpoints
6. ⏭️ Update frontend with API endpoint
7. ⏭️ Test end-to-end

**Your Next Command:**
```bash
cd backend
npm install
```

---

**Last Updated:** March 2, 2026

**Status:** Ready to deploy backend! 🚀
