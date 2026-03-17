# Final Fix Steps - Lambda Handler Issue

## Current Status

✅ **CORS is FIXED** - No more CORS errors!
❌ **Lambda is failing** - 502 Bad Gateway due to wrong handler path

## The Problem

The Lambda function handler path was wrong:
- **Current (wrong)**: `handlers/auth.handler.loginHandler`
- **Should be**: `handlers/auth.loginHandler`

The `.handler` part should not be in the path because the file is named `auth.handler.ts` which compiles to `auth.js` (not `auth.handler.js`).

## Solution

### Option 1: Rename the Files (RECOMMENDED)

Rename the handler files to remove `.handler` from the filename:

1. **Rename files**:
   ```bash
   cd backend/src/handlers
   mv auth.handler.ts auth.ts
   mv emergency.handler.ts emergency.ts
   mv escalation-checker.handler.ts escalation-checker.ts
   mv kb-warming.handler.ts kb-warming.ts
   mv triage.handler.ts triage.ts
   mv voice.handler.ts voice.ts
   ```

2. **Update imports** in all files that import these handlers

3. **Rebuild**:
   ```bash
   cd backend
   npm run build
   ```

4. **Deploy**:
   ```bash
   sam build
   sam deploy --config-file samconfig.toml
   ```

### Option 2: Fix Handler Paths in template.yaml (EASIER)

I already updated the template.yaml, but the deployment didn't complete. You need to:

1. **Close any programs** that might have files open in `backend/.aws-sam/build`

2. **Delete the build folder**:
   ```powershell
   Remove-Item -Recurse -Force backend/.aws-sam
   ```

3. **Rebuild**:
   ```powershell
   cd backend
   sam build
   ```

4. **Deploy**:
   ```powershell
   sam deploy --config-file samconfig.toml --no-confirm-changeset
   ```

5. **Fix CORS OPTIONS** (after deployment):
   ```powershell
   node fix-cors-options.js
   ```

## Quick Manual Fix (FASTEST)

Since the template changes are already made, just update the Lambda configuration directly:

```powershell
# Update LoginFunction
aws lambda update-function-configuration `
  --function-name asha-triage-dev-login `
  --handler handlers/auth.loginHandler

# Update RegisterFunction  
aws lambda update-function-configuration `
  --function-name asha-triage-dev-register `
  --handler handlers/auth.registerHandler

# Wait 5 seconds for changes to propagate
Start-Sleep -Seconds 5

# Test
$headers = @{'Content-Type'='application/json'}
$body = '{"username":"asha_worker_001","password":"demo123"}'
Invoke-WebRequest -Uri "https://mrl5y4bb52.execute-api.ap-south-1.amazonaws.com/development/auth/login" -Method POST -Headers $headers -Body $body -UseBasicParsing
```

## After Fix

Once the handler path is fixed, try logging in from your frontend:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart frontend** (`npm start`)
3. **Try to login**:
   - Username: `asha_worker_001`
   - Password: `demo123`

## Expected Result

✅ No CORS errors
✅ Login should work (or show proper authentication error from Cognito)
✅ Clean console!

## Current Files Changed

- `backend/template.yaml` - Handler paths fixed
- `backend/src/handlers/auth.handler.ts` - CORS headers fixed
- `backend/dist/package.json` - Added for dependencies
- `backend/fix-cors-options.js` - Script to fix OPTIONS methods

## Summary

The CORS issue is completely resolved. The remaining issue is just the Lambda handler path, which can be fixed with a simple configuration update or by renaming the files.

Last Updated: March 9, 2026
