# CORS Fix Deployment Script
# This script rebuilds and redeploys the backend with CORS fixes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CORS Fix Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean previous build
Write-Host "[1/4] Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force dist
    Write-Host "✓ Cleaned dist folder" -ForegroundColor Green
}

# Step 2: Build TypeScript
Write-Host ""
Write-Host "[2/4] Building TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green

# Step 3: Deploy to AWS
Write-Host ""
Write-Host "[3/4] Deploying to AWS..." -ForegroundColor Yellow
sam deploy --config-file samconfig.toml --no-confirm-changeset
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Deployment successful" -ForegroundColor Green

# Step 4: Get API endpoint
Write-Host ""
Write-Host "[4/4] Getting API endpoint..." -ForegroundColor Yellow
$stackName = "asha-triage-backend"
$apiEndpoint = aws cloudformation describe-stacks --stack-name $stackName --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text

if ($apiEndpoint) {
    Write-Host "✓ API Endpoint: $apiEndpoint" -ForegroundColor Green
} else {
    Write-Host "⚠ Could not retrieve API endpoint" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "2. Restart frontend (npm start)" -ForegroundColor White
Write-Host "3. Try to login" -ForegroundColor White
Write-Host "4. Check console - should be clean!" -ForegroundColor White
Write-Host ""
Write-Host "To test CORS:" -ForegroundColor Yellow
Write-Host "curl -X OPTIONS $apiEndpoint/auth/login -v" -ForegroundColor White
Write-Host ""
