# Cognito Setup - Configuration Summary

## ✅ What You've Completed

- [x] Created User Pool: **User pool - ge4ots**
- [x] Created App Client: **doorstep-doctor-app**
- [x] Got User Pool ID: `ap-south-1_ajBNkM3s5`
- [x] Got Client ID: `4lr9hop3bcar8csf05o8nd50mu`
- [x] Created `.env.local` file with Cognito values

---

## 🔧 Next Steps to Complete Cognito Setup

### Step 1: Configure Callback URLs

1. Go to AWS Cognito Console
2. Click on **"User pool - ge4ots"**
3. Go to **"App integration"** tab
4. Scroll to **"App clients and analytics"**
5. Click on **"doorstep-doctor-app"**
6. Click **"Edit"** under "Hosted UI settings"

**Add these URLs:**

**Allowed callback URLs:**
```
http://localhost:3000
http://localhost:3000/callback
```

**Allowed sign-out URLs:**
```
http://localhost:3000
http://localhost:3000/logout
```

**OAuth 2.0 grant types:**
- ✅ Authorization code grant
- ✅ Implicit grant

**OpenID Connect scopes:**
- ✅ openid
- ✅ email
- ✅ phone
- ✅ profile

Click **"Save changes"**

---

### Step 2: Add Custom Attributes

1. Stay in your User Pool
2. Go to **"Sign-up experience"** tab
3. Scroll to **"Custom attributes"** section
4. Click **"Add custom attribute"**

**Add these 4 attributes:**

| Attribute Name | Type | Mutable | Min | Max |
|----------------|------|---------|-----|-----|
| `role` | String | Yes | 1 | 20 |
| `district` | String | Yes | 1 | 50 |
| `state` | String | Yes | 1 | 50 |
| `phc_assignment` | String | Yes | 0 | 100 |

---

### Step 3: Create Test Users

1. Go to **"Users"** tab
2. Click **"Create user"**

**ASHA Worker:**
```
Username: asha1
Email: asha1@example.com
Phone: +919876543210
Temporary password: TempPass123!
Send email invitation: No
Mark email as verified: Yes
Mark phone as verified: Yes
```

After creation, add custom attributes:
- Go to user details
- Click "Edit" under "Attributes"
- Add:
  - `custom:role` = `asha`
  - `custom:district` = `Mumbai`
  - `custom:state` = `Maharashtra`
  - `custom:phc_assignment` = `PHC Mumbai Central`

**PHC Doctor:**
```
Username: phc1
Email: phc1@example.com
Phone: +919876543211
Temporary password: TempPass123!
Send email invitation: No
Mark email as verified: Yes
Mark phone as verified: Yes
```

After creation, add custom attributes:
- `custom:role` = `phc`
- `custom:district` = `Mumbai`
- `custom:state` = `Maharashtra`
- `custom:phc_assignment` = `PHC Mumbai Central`

---

## 📝 Your Configuration Files

### Frontend: `.env.local` ✅ Created

```env
REACT_APP_COGNITO_USER_POOL_ID=ap-south-1_ajBNkM3s5
REACT_APP_COGNITO_CLIENT_ID=4lr9hop3bcar8csf05o8nd50mu
REACT_APP_COGNITO_REGION=ap-south-1
REACT_APP_API_ENDPOINT=http://localhost:3001
```

### Backend: `backend/.env` ✅ Created

```env
COGNITO_USER_POOL_ID=ap-south-1_ajBNkM3s5
COGNITO_CLIENT_ID=4lr9hop3bcar8csf05o8nd50mu
AWS_REGION=ap-south-1
```

---

## 🧪 Testing Your Setup

Once you complete Steps 1-3 above:

### Test 1: Start Frontend

```bash
npm start
```

Open http://localhost:3000

### Test 2: Try Login

Use demo credentials:
- Username: `asha1`
- Password: `TempPass123!`

You'll be prompted to change password on first login.

### Test 3: Verify User Info

After login, check that you can see:
- User name
- User role (asha or phc)
- District and state

---

## 🎯 Cognito Setup Checklist

- [ ] Callback URLs configured
- [ ] Custom attributes added (role, district, state, phc_assignment)
- [ ] Test user `asha1` created with custom attributes
- [ ] Test user `phc1` created with custom attributes
- [ ] `.env.local` file created ✅
- [ ] `backend/.env` file created ✅
- [ ] Login tested successfully

---

## 🚀 What's Next After Cognito?

Once Cognito is fully configured:

1. **Set up Bedrock Knowledge Base** (AWS_SETUP_GUIDE.txt - Section 3)
2. **Deploy Backend** (backend/DEPLOYMENT.md)
3. **Test End-to-End** (Submit triage request)
4. **Deploy Frontend** (FRONTEND_DEPLOYMENT.md)

---

## 📞 Need Help?

**Common Issues:**

**Issue**: Can't log in
- Check callback URLs are configured
- Verify user exists and is confirmed
- Check password meets requirements

**Issue**: Custom attributes not showing
- Make sure you added them in "Sign-up experience" tab
- Verify attribute names are correct (lowercase)
- Check you set them on the user after creation

**Issue**: "User does not exist" error
- Create the user in Cognito console
- Mark email as verified
- Set custom attributes

---

**Status**: Cognito User Pool Created ✅

**Next Step**: Complete Steps 1-3 above, then move to Bedrock setup

**Last Updated**: March 2, 2026
