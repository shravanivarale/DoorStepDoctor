# Quick Deployment Checklist - Fix Login Connection Error

## ❌ Current Situation
- ✗ Your app shows: `net::ERR_CONNECTION_REFUSED` on login
- ✗ Connection to `http://localhost:3000` fails on production
- ✓ Your backend API is deployed to: `https://mrl5y4bb52.execute-api.ap-south-1.amazonaws.com/development`

---

## ✅ Fix (5 minutes)

### 1. Open Vercel Project Settings
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "doorstep-doctor-demo" project
- [ ] Click **Settings** tab

### 2. Add Environment Variables
- [ ] Click **Environment Variables** in left menu
- [ ] Click **Add New** button
- [ ] Fill in these variables with **exactly** these values:

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

**⚠️ Important:** 
- Select "All Environments" for each variable (or Production)
- Do NOT add these to your code
- Do NOT commit .env files to GitHub

### 3. Redeploy
- [ ] Go to **Deployments** tab
- [ ] Find your latest deployment (probably shows ❌)
- [ ] Click **...** menu on that deployment
- [ ] Click **Redeploy**
- [ ] Wait 3-5 minutes for deployment

### 4. Test
- [ ] Go to your Vercel URL (check Deployments → Domain)
- [ ] Try to login
- [ ] Should now work or show a proper error message (not "Connection Refused")

---

## 🔍 How to Verify It Worked

### In Browser Console (Press F12):
```javascript
// You should see one of these messages:

// ✓ If API is reachable:
console.log(process.env.REACT_APP_API_ENDPOINT)
// Output: https://mrl5y4bb52.execute-api.ap-south-1.amazonaws.com/development

// ✓ If login credentials are wrong:
// Error: {"message":"User does not exist", "code":"UserNotFound"}

// ✗ If still broken:
// GET http://localhost:3000/... net::ERR_CONNECTION_REFUSED
```

---

## ❓ I Did All That and Still Getting Error?

### 1. Check the error type in console:
- **"Failed to fetch" or "Connection refused"** → Environment variables not set (repeat checklist)
- **"401 Unauthorized"** → API works, wrong credentials ✓
- **"403 Forbidden"** → CORS issue, contact backend team
- **"500 Server Error"** → Backend issue, check backend logs

### 2. Verify you redeployed AFTER setting variables:
- [ ] New deployment should show ✓ (green checkmark)
- [ ] Build logs should show your API endpoint being used
- [ ] Scroll down in deployment logs to see "Build completed"

### 3. Clear browser cache:
- [ ] Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- [ ] Or open in Incognito/Private window

---

## 📞 If You Still Need Help

1. **Check deployment logs:**
   - Vercel Deployments tab → Latest deployment → Logs
   - Look for "REACT_APP_API_ENDPOINT" in the output
   - Should show your actual API URL, not localhost

2. **Check backend is running:**
   - Open your AWS Console
   - Navigate to API Gateway
   - Check that your API stage "development" is deployed

3. **Test backend directly:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Paste and run:
   ```javascript
   fetch('https://mrl5y4bb52.execute-api.ap-south-1.amazonaws.com/development/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username: 'test', password: 'test' })
   }).then(r => r.json()).then(d => console.log('Response:', d))
   ```
   - Should get API response (even if auth fails), not "connection refused"

---

## 📝 Summary

| Issue | Cause | Solution |
|-------|-------|----------|
| `localhost:3000` connection error | Environment variables not in Vercel | Add variables to Vercel Settings |
| Works locally but fails on Vercel | .env.local is not deployed | Use Vercel environment variables |
| "Failed to fetch" on deployed site | REACT_APP_API_ENDPOINT not set | Re-run this checklist |

---

## ✨ What Changed in Code

1. **api.ts** - Better error messages and environment detection
2. **LoginForm.tsx** - Helpful hints when connection fails
3. **getAPIEndpoint()** - New function to properly detect environment

These changes help you debug deployment issues faster!

---

**Done?** Your app should now connect to your backend API when deployed. 🎉
