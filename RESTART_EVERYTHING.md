# Restart Everything - Complete Reset

If CORS errors persist, follow these steps:

## Step 1: Close Everything
1. Close all browser windows
2. Stop the frontend server (Ctrl+C in terminal)

## Step 2: Clear Browser Data
1. Open browser
2. Press `Ctrl + Shift + Delete`
3. Select:
   - ✅ Browsing history
   - ✅ Cookies and other site data
   - ✅ Cached images and files
4. Time range: "All time"
5. Click "Clear data"
6. Close browser completely

## Step 3: Restart Frontend
```bash
# In your project directory
npm start
```

## Step 4: Test in Incognito
1. Open incognito window (`Ctrl + Shift + N`)
2. Go to http://localhost:3000 or http://localhost:3001
3. Try to login with:
   - Username: `asha_worker_001`
   - Password: `demo123`

## Step 5: Check Console
Press F12 and check the Console tab. You should see:
- ✅ No CORS errors
- ✅ No "blocked by CORS policy" messages
- ✅ Clean console

## If Still Not Working

### Test the API Directly
1. Open `test-cors.html` in your browser
2. Click "Test Login API"
3. Should see success message

### Check Network Tab
1. Press F12
2. Go to Network tab
3. Try to login
4. Click on the "login" request
5. Check the "Headers" tab
6. Look for "Access-Control-Allow-Origin" in Response Headers

### Verify API Gateway
Run this in PowerShell:
```powershell
Invoke-WebRequest -Uri "https://mrl5y4bb52.execute-api.ap-south-1.amazonaws.com/development/auth/login" -Method OPTIONS -UseBasicParsing | Select-Object -ExpandProperty Headers
```

Should see:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
```

## Nuclear Option: Different Browser

If nothing works, try a completely different browser:
- If using Chrome, try Firefox
- If using Firefox, try Chrome
- Try Edge

This will prove if it's a browser-specific cache issue.

## Contact Support

If none of this works, there might be:
1. A firewall blocking the requests
2. Antivirus interfering
3. Network proxy issues
4. VPN causing problems

Try disabling these temporarily to test.
