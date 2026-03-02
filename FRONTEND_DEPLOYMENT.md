# Frontend Deployment Guide - DoorStepDoctor

## Prerequisites

Before deploying the frontend, ensure you have:

1. ✅ Node.js 18+ and npm installed
2. ✅ Backend API deployed and API Gateway URL available
3. ✅ AWS Cognito User Pool configured
4. ✅ AWS account with appropriate permissions

## Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Verify installation
npm list react react-dom typescript
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your AWS configuration:

```env
# Get this from your backend deployment output
REACT_APP_API_ENDPOINT=https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod

# Get these from AWS Cognito Console
REACT_APP_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
REACT_APP_COGNITO_CLIENT_ID=your-client-id-here
REACT_APP_COGNITO_REGION=ap-south-1

# Feature flags
REACT_APP_ENABLE_VOICE=true
REACT_APP_ENABLE_VIDEO=true
REACT_APP_ENABLE_ANALYTICS=true

# Low bandwidth threshold (Mbps)
REACT_APP_LOW_BANDWIDTH_THRESHOLD=1.0
```

## Step 3: Build the Application

```bash
# Development build (with source maps)
npm run build

# Production build (optimized)
NODE_ENV=production npm run build
```

The build output will be in the `build/` directory.

## Step 4: Test Locally

Before deploying, test the build locally:

```bash
# Install serve globally
npm install -g serve

# Serve the build directory
serve -s build -p 3000

# Open http://localhost:3000 in your browser
```

## Deployment Options

### Option 1: AWS Amplify (Recommended)

AWS Amplify provides automatic CI/CD, SSL certificates, and global CDN.

#### 1. Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### 2. Initialize Amplify

```bash
amplify init

# Answer the prompts:
# - Project name: doorstep-doctor
# - Environment: prod
# - Default editor: Visual Studio Code
# - App type: javascript
# - Framework: react
# - Source directory: src
# - Distribution directory: build
# - Build command: npm run build
# - Start command: npm start
```

#### 3. Add Hosting

```bash
amplify add hosting

# Select:
# - Hosting with Amplify Console (Managed hosting with custom domains, SSL)
# - Manual deployment
```

#### 4. Deploy

```bash
# Build and deploy
amplify publish

# Your app will be available at:
# https://prod.xxxxxx.amplifyapp.com
```

#### 5. Configure Custom Domain (Optional)

1. Go to AWS Amplify Console
2. Select your app
3. Click "Domain management"
4. Add your custom domain
5. Follow DNS configuration instructions

### Option 2: AWS S3 + CloudFront

Host static files on S3 with CloudFront CDN for global distribution.

#### 1. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://doorstep-doctor-frontend --region ap-south-1

# Enable static website hosting
aws s3 website s3://doorstep-doctor-frontend \
  --index-document index.html \
  --error-document index.html
```

#### 2. Configure Bucket Policy

Create `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::doorstep-doctor-frontend/*"
    }
  ]
}
```

Apply the policy:

```bash
aws s3api put-bucket-policy \
  --bucket doorstep-doctor-frontend \
  --policy file://bucket-policy.json
```

#### 3. Upload Build Files

```bash
# Sync build directory to S3
aws s3 sync build/ s3://doorstep-doctor-frontend \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "service-worker.js"

# Upload index.html with no-cache
aws s3 cp build/index.html s3://doorstep-doctor-frontend/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

#### 4. Create CloudFront Distribution

```bash
# Create distribution
aws cloudfront create-distribution \
  --origin-domain-name doorstep-doctor-frontend.s3-website.ap-south-1.amazonaws.com \
  --default-root-object index.html

# Note the Distribution ID and Domain Name from output
```

#### 5. Configure Custom Error Pages

Update CloudFront to handle React Router:

1. Go to CloudFront Console
2. Select your distribution
3. Go to "Error Pages" tab
4. Create custom error response:
   - HTTP Error Code: 403, 404
   - Customize Error Response: Yes
   - Response Page Path: /index.html
   - HTTP Response Code: 200

### Option 3: Vercel (Alternative)

Quick deployment with automatic SSL and global CDN.

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Deploy

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow the prompts
```

#### 3. Configure Environment Variables

```bash
# Add environment variables
vercel env add REACT_APP_API_ENDPOINT production
vercel env add REACT_APP_COGNITO_USER_POOL_ID production
vercel env add REACT_APP_COGNITO_CLIENT_ID production
```

## Step 5: Post-Deployment Configuration

### 1. Update CORS in Backend

Add your frontend domain to the backend CORS configuration:

```yaml
# In backend/template.yaml
Cors:
  AllowOrigins:
    - "https://your-frontend-domain.com"
    - "https://prod.xxxxxx.amplifyapp.com"
  AllowMethods:
    - GET
    - POST
    - PUT
    - DELETE
    - OPTIONS
  AllowHeaders:
    - Content-Type
    - Authorization
```

Redeploy backend:

```bash
cd backend
npm run deploy:prod
```

### 2. Configure Cognito Callback URLs

1. Go to AWS Cognito Console
2. Select your User Pool
3. Go to "App integration" → "App client settings"
4. Add your frontend URLs to:
   - Callback URLs: `https://your-domain.com/callback`
   - Sign out URLs: `https://your-domain.com/logout`

### 3. Test the Deployment

1. Open your deployed URL
2. Test login functionality
3. Submit a test triage request
4. Verify voice recording works (check browser permissions)
5. Test emergency escalation flow
6. Check PHC dashboard (if you have PHC role)

## Step 6: Enable HTTPS (if using S3 directly)

If you deployed to S3 without CloudFront:

1. Create CloudFront distribution (see Option 2, Step 4)
2. Request SSL certificate in AWS Certificate Manager
3. Attach certificate to CloudFront distribution
4. Update DNS to point to CloudFront domain

## Monitoring and Analytics

### 1. Enable CloudWatch RUM (Real User Monitoring)

```bash
# Install AWS CloudWatch RUM
npm install --save aws-rum-web

# Add to src/index.tsx
import { AwsRum } from 'aws-rum-web';

const awsRum = new AwsRum(
  'doorstep-doctor',
  '1.0.0',
  'ap-south-1',
  {
    sessionSampleRate: 1,
    guestRoleArn: 'arn:aws:iam::ACCOUNT_ID:role/RUM-Monitor',
    identityPoolId: 'ap-south-1:IDENTITY_POOL_ID',
    endpoint: 'https://dataplane.rum.ap-south-1.amazonaws.com',
    telemetries: ['performance', 'errors', 'http'],
    allowCookies: true,
    enableXRay: false
  }
);
```

### 2. Configure Google Analytics (Optional)

Add to `public/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API Calls Fail

1. Check CORS configuration in backend
2. Verify API Gateway URL in `.env.local`
3. Check browser console for errors
4. Verify Cognito configuration

### Voice Recording Not Working

1. Ensure HTTPS is enabled (required for microphone access)
2. Check browser permissions
3. Test in Chrome/Edge (best support for MediaRecorder API)
4. Check console for errors

### Blank Page After Deployment

1. Check browser console for errors
2. Verify `homepage` in `package.json` matches deployment path
3. Check CloudFront error pages configuration
4. Verify all environment variables are set

## Performance Optimization

### 1. Enable Compression

For S3 + CloudFront:

```bash
# Compress files before upload
find build -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' \) \
  -exec gzip -9 -k {} \;

# Upload with Content-Encoding
aws s3 sync build/ s3://doorstep-doctor-frontend \
  --content-encoding gzip \
  --exclude "*.gz"
```

### 2. Enable Caching

Update CloudFront cache behaviors:

- Static assets (JS, CSS, images): Cache for 1 year
- index.html: No cache
- API calls: No cache

### 3. Code Splitting

Already configured in React. Verify in build output:

```bash
npm run build

# Should see multiple chunk files:
# - main.[hash].js
# - [number].[hash].chunk.js
```

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          REACT_APP_API_ENDPOINT: ${{ secrets.API_ENDPOINT }}
          REACT_APP_COGNITO_USER_POOL_ID: ${{ secrets.COGNITO_POOL_ID }}
          REACT_APP_COGNITO_CLIENT_ID: ${{ secrets.COGNITO_CLIENT_ID }}
        run: npm run build
        
      - name: Deploy to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws s3 sync build/ s3://doorstep-doctor-frontend --delete
          
      - name: Invalidate CloudFront
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables not committed to git
- [ ] API keys stored in AWS Secrets Manager
- [ ] CORS properly configured
- [ ] Content Security Policy headers set
- [ ] XSS protection enabled
- [ ] Cognito authentication working
- [ ] Rate limiting configured in API Gateway

## Cost Estimation

### AWS Amplify
- Hosting: $0.15 per GB served
- Build minutes: $0.01 per minute
- Estimated: $5-15/month for 1000 users

### S3 + CloudFront
- S3 storage: $0.023 per GB
- CloudFront data transfer: $0.085 per GB
- Estimated: $3-10/month for 1000 users

## Support

For issues:
1. Check browser console for errors
2. Review CloudWatch logs
3. Verify all environment variables
4. Test API endpoints with Postman
5. Check AWS service health dashboard

## Next Steps

1. ✅ Deploy frontend
2. ⏳ Configure custom domain
3. ⏳ Set up monitoring
4. ⏳ Enable analytics
5. ⏳ Configure CI/CD
6. ⏳ User acceptance testing
7. ⏳ Performance optimization
8. ⏳ Security audit

---

**Deployment Status**: Ready for production deployment

**Last Updated**: March 2026

**Version**: 1.0.0
