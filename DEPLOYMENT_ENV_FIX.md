# Deployment Environment Variables Fix

## Problem
When deployed to production (Vercel), the frontend cannot connect to the backend API because `.env.local` is not included in the deployment. The app falls back to `localhost:3000` which doesn't exist.

## Solution: Configure Environment Variables in Vercel

### Step 1: Go to Vercel Project Settings
1. Visit https://vercel.com/dashboard
2. Select your "doorstep-doctor-demo" project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add Environment Variables
Add the following variables for your deployment environment:

**For Production (Main Branch):**
```
REACT_APP_API_ENDPOINT = https://mrl5y4bb52.execute-api.ap-south-1.amazonaws.com/development
REACT_APP_COGNITO_USER_POOL_ID = ap-south-1_ajBNkM3s5
REACT_APP_COGNITO_CLIENT_ID = 4lr9hop3bcar8csf05o8nd50mu
REACT_APP_COGNITO_REGION = ap-south-1
REACT_APP_ENABLE_VOICE = true
REACT_APP_ENABLE_VIDEO = true
REACT_APP_ENABLE_ANALYTICS = true
REACT_APP_LOW_BANDWIDTH_THRESHOLD = 1.0
```

**For Preview/Staging:**
Same values as above (unless you have a separate staging API)

### Step 3: Redeploy
After adding environment variables:
1. Go to **Deployments** tab
2. Click the **...** menu on the latest failed deployment
3. Select **Redeploy**
4. Wait for deployment to complete

### Step 4: Verify
Test login at your Vercel URL. You should now see proper error messages instead of connection refused.

---

## Additional Notes

### What Changed in api.ts
- Better error detection for production builds
- Warning message in development if `REACT_APP_API_ENDPOINT` is not set
- Helpful error messages to guide configuration

### .gitignore Consideration
Make sure your `.gitignore` includes:
```
.env.local
.env.*.local
```

This is intentional - local files should never be committed.

### Troubleshooting

If you still get connection errors after deployment:

1. **Verify Variables are Set:**
   - In Vercel dashboard, check Environment Variables are visible
   - Look at Deployment logs: Vercel should show them being used during build

2. **Check API Endpoint is Correct:**
   - Verify the API Gateway URL from AWS Console
   - Ensure the stage is correct (development/prod)

3. **Test Connectivity:**
   - From browser console: `fetch('https://your-api-endpoint/auth/login')`
   - Should return CORS error (expected), not connection refused

4. **Check CloudFront/API-Gateway:**
   - Ensure your API Gateway is deployed and running
   - Check CORS is properly configured in backend
