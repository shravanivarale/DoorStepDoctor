# Environment Variables & Deployment Configuration Guide

## 🎯 The Problem You're Facing

When your app is **deployed to Vercel**, it shows this error:
```
net::ERR_CONNECTION_REFUSED
POST http://localhost:3000/auth/login
```

This happens because:
1. Your `.env.local` file contains the correct API endpoint
2. But `.env.local` is **NOT deployed to Vercel** (it's in .gitignore)
3. React falls back to the hardcoded `localhost:3000`
4. `localhost:3000` doesn't exist on Vercel's servers → connection refused

---

## ✅ How to Fix It

### Local Development (Already Working ✓)
Your `.env.local` file is correctly configured:
```
REACT_APP_API_ENDPOINT=https://mrl5y4bb52.execute-api.ap-south-1.amazonaws.com/development
```

**For local development:** Just run `npm start` - it works!

### Production Deployment (Vercel) - MUST DO

**The key difference:** Environment variables must be set in **Vercel's dashboard**, NOT in code.

#### Step-by-Step Fix for Vercel

1. **Open Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Click your "doorstep-doctor-demo" project

2. **Access Project Settings**
   - Click **Settings** tab (top right)
   - Click **Environment Variables** in left sidebar

3. **Add Environment Variables** for Production
   
   For **Production** (main/master branch):
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

4. **Redeploy Your Application**
   - Go to **Deployments** tab
   - Find your latest deployment (the failed one)
   - Click the **...** menu
   - Select **Redeploy**
   - Wait for the new deployment to complete

5. **Test the Fix**
   - Go to your Vercel URL
   - Try to login
   - Should now either:
     - ✓ Connect to backend and authenticate
     - OR show proper error message (not connection refused)

---

## 📋 Why This Happens

### Local Development (.env.local)
```
npm start
  ↓
.env.local is loaded
  ↓
REACT_APP_API_ENDPOINT = https://api.example.com
  ✓ Works!
```

### Vercel Deployment (.env.local is NOT deployed)
```
git push
  ↓
Vercel clones your repo
  ↓
.env.local is in .gitignore → NOT downloaded
  ↓
REACT_APP_API_ENDPOINT = undefined
  ↓
Falls back to hardcoded localhost:3000
  ✗ Connection refused!
```

### Correct Vercel Deployment
```
git push
  ↓
Vercel clones your repo
  ↓
Vercel injects environment variables from dashboard
  ↓
REACT_APP_API_ENDPOINT = https://api.example.com (from Vercel settings)
  ↓
  ✓ Works!
```

---

## 🔍 Troubleshooting

### Still getting connection errors?

**Check 1: Verify variables are in Vercel**
- Go to Vercel Dashboard → Settings → Environment Variables
- Confirm `REACT_APP_API_ENDPOINT` is there
- Check it's set for the correct environment (Production)

**Check 2: Is the deployment using the new variables?**
- Go to Deployments tab
- Click on your latest deployment
- Look for "Environment Variables" section in the build logs
- Should show your API endpoint being used

**Check 3: Did you redeploy after adding environment variables?**
- Simply adding variables in Vercel doesn't automatically redeploy
- Must manually redeploy or push a new commit

**Check 4: Is your backend API actually running?**
- Manually test: `https://mrl5y4bb52.execute-api.ap-south-1.amazonaws.com/development/auth/login`
- Should return an error or CORS message, NOT "connection refused"
- If it fails, your AWS backend may not be deployed

**Check 5: Test from browser console**
```javascript
// Open browser console (F12) on your Vercel site and run:
fetch('https://mrl5y4bb52.execute-api.ap-south-1.amazonaws.com/development/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'test', password: 'test' })
})
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.log('Error:', e.message))
```

---

## 🔐 Environment Variables Explained

| Variable | Purpose | Local Value | Production Value |
|----------|---------|------------|------------------|
| `REACT_APP_API_ENDPOINT` | Backend API URL | http://localhost:3000 | https://your-api-gateway.com |
| `REACT_APP_COGNITO_USER_POOL_ID` | AWS Cognito pool | ap-south-1_ajBNkM3s5 | Same for all |
| `REACT_APP_COGNITO_CLIENT_ID` | Cognito client ID | 4lr9hop3bcar8csf05o8nd50mu | Same for all |
| `REACT_APP_ENABLE_VOICE` | Enable speech features | true | true |

---

## 🛠️ Code Changes Made

### 1. Enhanced api.ts
- Better environment detection
- Helpful console warnings in development
- Detailed error messages for connection failures

### 2. Better error messages in LoginForm.tsx
- Users now see hints about environment variable configuration
- Clear guidance for Vercel deployment

### 3. New helper function getAPIEndpoint()
- Validates configuration
- Prevents silent failures in production

---

## 📚 Quick Reference

### Development
```bash
# Just run this - .env.local is loaded automatically
npm start
```

### Production (Vercel)
1. Set environment variables in Vercel Dashboard
2. Redeploy
3. Test at your Vercel URL

### If you're using a different platform (AWS Amplify, Netlify, etc.)
Find their environment variables section and add the same variables there.

---

## 🚀 Next Steps

1. ✅ Go to Vercel → Settings → Environment Variables
2. ✅ Add the REACT_APP_API_ENDPOINT and other variables
3. ✅ Redeploy from Deployments tab
4. ✅ Test login on your Vercel URL
5. ✅ Check browser console (F12) for detailed error messages

You should see helpful error messages now that will guide you through any remaining issues!
