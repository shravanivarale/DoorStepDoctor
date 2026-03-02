# Cognito Setup - Troubleshooting Guide

## Issue 1: Sign-In Options - Only Email and Phone Number Available

**What you're seeing:**
```
Cognito user pool sign-in options
☐ Email
☐ Phone number
```

**Solution:** Select **Email** only

**Why?**
- ASHA workers and PHC doctors will use email addresses to log in
- Phone numbers are optional for this application
- Email is more reliable for healthcare worker authentication

**Important:** You only need to select ONE option. Choose Email.

---

## Issue 2: Custom Attributes Not in "Required attributes for sign-up"

**What you're looking for:**
- Custom attributes like `role`, `district`, `state`, `phc_assignment`

**Why you can't find them:**
- Custom attributes are NOT added during user pool creation
- They are added AFTER the user pool is created
- The "Required attributes for sign-up" section only shows standard Cognito attributes

**Solution:**

### During User Pool Creation:
1. For "Required attributes for sign-up", just keep **email** (default)
2. Click "Next" and complete the user pool creation
3. Don't worry about custom attributes yet

### After User Pool is Created:
1. Go to your User Pool in Cognito Console
2. Click on **"Sign-up experience"** tab
3. Scroll down to **"Custom attributes"** section
4. Click **"Add custom attribute"**
5. Add each custom attribute one by one:
   - `role` (String, 1-20 chars)
   - `district` (String, 1-50 chars)
   - `state` (String, 1-50 chars)
   - `phc_assignment` (String, 0-100 chars)

---

## Issue 3: npm start Errors - "Cannot find module './App'"

**What you're seeing:**
```
Module not found: Error: Can't resolve './App'
```

**Root Cause:** Missing `tsconfig.json` file

**Solution:** ✅ Fixed! I just created the `tsconfig.json` file for you.

**Next Steps:**

1. **Clear the cache and restart:**
   ```bash
   rm -rf node_modules/.cache
   npm start
   ```

2. **If still having issues, try:**
   ```bash
   npm install
   npm start
   ```

3. **Verify the dev server starts:**
   - You should see: "Compiled successfully!"
   - Open http://localhost:3000 in your browser

---

## Current Status

### ✅ Completed
- [x] Cognito User Pool created
- [x] User Pool ID: `ap-south-1_ajBNkM3s5`
- [x] Client ID: `4lr9hop3bcar8csf05o8nd50mu`
- [x] `.env.local` file created
- [x] `backend/.env` file created
- [x] `tsconfig.json` file created (just now!)

### 🔄 In Progress
- [ ] Configure callback URLs in Cognito
- [ ] Add custom attributes in Cognito
- [ ] Create test users (asha1, phc1)
- [ ] Test frontend login

### ⏭️ Next Steps
1. **Finish Cognito setup** (follow COGNITO_SETUP_COMPLETE.md)
2. **Test frontend** (npm start should work now!)
3. **Set up Bedrock** (AWS_SETUP_GUIDE.txt - Section 3)

---

## Quick Reference: Where to Find Things in Cognito Console

### To add Custom Attributes:
1. AWS Console → Cognito → User Pools
2. Click on "User pool - ge4ots"
3. **"Sign-up experience"** tab (left sidebar)
4. Scroll to "Custom attributes" section
5. Click "Add custom attribute"

### To configure Callback URLs:
1. AWS Console → Cognito → User Pools
2. Click on "User pool - ge4ots"
3. **"App integration"** tab (left sidebar)
4. Scroll to "App clients and analytics"
5. Click on "doorstep-doctor-app"
6. Click "Edit" under "Hosted UI settings"

### To create Test Users:
1. AWS Console → Cognito → User Pools
2. Click on "User pool - ge4ots"
3. **"Users"** tab (left sidebar)
4. Click "Create user"

---

## Understanding User Authentication Flow

**Who logs in?**
- ✅ ASHA workers (healthcare workers in villages)
- ✅ PHC doctors (doctors at Primary Health Centers)

**Who does NOT log in?**
- ❌ Rural patients (they never create accounts)
- ❌ Family members of patients

**How do rural patients use the system?**
- ASHA workers visit them at home
- ASHA worker logs in with their own account
- ASHA worker enters patient symptoms on their behalf
- System provides triage recommendations to ASHA worker
- No login required for patients!

**Why Email sign-in?**
- ASHA workers are trained healthcare workers with email addresses
- PHC doctors are medical professionals with email addresses
- More reliable than phone numbers
- Easier to manage and reset passwords

---

## Testing Checklist

Once you complete Cognito setup, test in this order:

1. **Frontend starts without errors**
   ```bash
   npm start
   ```
   Expected: "Compiled successfully!" at http://localhost:3000

2. **Login page loads**
   - Navigate to http://localhost:3000/login
   - You should see the login form

3. **Can log in with test user**
   - Username: `asha1`
   - Password: `TempPass123!`
   - Should redirect to home page after login

4. **User info displays correctly**
   - Check that user name shows in navbar
   - Verify role-based navigation (ASHA sees "Triage" link)

5. **Can access protected routes**
   - ASHA user can access /triage
   - PHC user can access /emergency-queue

---

**Last Updated:** March 2, 2026

**Status:** Frontend build error fixed ✅ | Cognito setup in progress 🔄
