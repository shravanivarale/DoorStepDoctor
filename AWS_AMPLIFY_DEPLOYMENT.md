# 🚀 Deploy Frontend to AWS Amplify

## Why AWS Amplify?
- ✅ Native AWS service (perfect for AWS AI for Bharat)
- ✅ Connects to GitHub automatically
- ✅ Auto-deploys on every commit
- ✅ Provides AWS-hosted URL
- ✅ Free tier: 1000 build minutes/month
- ✅ Shows complete AWS stack integration

## 📋 Deployment Steps (5 minutes)

### Step 1: Go to AWS Amplify Console
1. Open AWS Console: https://console.aws.amazon.com/
2. Search for "Amplify" in the search bar
3. Click "AWS Amplify"
4. Click "Get Started" under "Amplify Hosting"

### Step 2: Connect GitHub Repository
1. Select "GitHub" as the repository service
2. Click "Continue"
3. Authorize AWS Amplify to access your GitHub
4. Select Repository: `DoorStepDoctor`
5. Select Branch: `main`
6. Click "Next"

### Step 3: Configure Build Settings
AWS will auto-detect Create React App. Verify these settings:

**App name:** `doorstep-doctor`

**Build settings:**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**Environment variables:** (Click "Advanced settings")
```
REACT_APP_API_ENDPOINT=https://mrl5y4bb52.execute-api.ap-south-1.amazonaws.com/development
REACT_APP_COGNITO_USER_POOL_ID=ap-south-1_ajBNkM3s5
REACT_APP_COGNITO_CLIENT_ID=4lr9hop3bcar8csf05o8nd50mu
REACT_APP_COGNITO_REGION=ap-south-1
CI=false
```

Click "Next"

### Step 4: Review and Deploy
1. Review all settings
2. Click "Save and deploy"
3. Wait 3-5 minutes for build to complete

### Step 5: Get Your AWS URL
After deployment, you'll see:
```
https://main.xxxxxxxxxx.amplifyapp.com
```

**This is your AWS-hosted frontend URL!** 🎉

## 🔧 Alternative: Manual Deployment

If you prefer command line:

### Install Amplify CLI
```powershell
npm install -g @aws-amplify/cli
amplify configure
```

### Initialize Amplify
```powershell
amplify init
```

### Add Hosting
```powershell
amplify add hosting
# Select: Hosting with Amplify Console
# Select: Manual deployment
```

### Deploy
```powershell
amplify publish
```

## 📊 Your Complete AWS Stack

After Amplify deployment, your architecture will be:

```
Frontend (AWS Amplify)
    ↓ HTTPS
API Gateway (AWS)
    ↓
Lambda Functions (AWS)
    ↓
DynamoDB + Bedrock + S3 (AWS)
```

**100% AWS Stack!** ✅

## 🎯 For Submission

You can now submit:
1. **GitHub**: https://github.com/shravanivarale/DoorStepDoctor
2. **AWS Amplify URL**: https://main.xxxxx.amplifyapp.com
3. **Backend API**: https://mrl5y4bb52.execute-api.ap-south-1.amazonaws.com/development

All hosted on AWS! Perfect for AWS AI for Bharat! 🇮🇳

## 💡 Benefits for Your Submission

1. **Full AWS Integration**: Shows you understand AWS ecosystem
2. **Serverless Architecture**: Frontend + Backend both serverless
3. **Auto-scaling**: Amplify scales automatically
4. **CI/CD**: Auto-deploys from GitHub
5. **Cost-effective**: Free tier covers development
6. **Professional**: Enterprise-grade deployment

## ⚡ Quick Test After Deployment

1. Open your Amplify URL
2. Try signup/login
3. Test triage form
4. Check emergency dashboard
5. Everything should work with your backend!

## 🔄 Auto-Deploy on Git Push

Every time you push to GitHub:
```powershell
git add .
git commit -m "Update feature"
git push origin main
```

Amplify automatically rebuilds and deploys! 🚀

---

**Recommendation**: Deploy to AWS Amplify now. It takes 5 minutes and shows complete AWS stack integration for your submission!
