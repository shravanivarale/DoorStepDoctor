# Wait for rollback to complete
Write-Host "Waiting for rollback to complete..."
aws cloudformation wait stack-rollback-complete --stack-name asha-triage-dev --region ap-south-1

# Delete the stack
Write-Host "Deleting stack..."
aws cloudformation delete-stack --stack-name asha-triage-dev --region ap-south-1

# Wait for deletion
Write-Host "Waiting for deletion to complete..."
aws cloudformation wait stack-delete-complete --stack-name asha-triage-dev --region ap-south-1

# Rebuild
Write-Host "Building..."
sam build

# Deploy
Write-Host "Deploying..."
sam deploy --no-confirm-changeset --no-fail-on-empty-changeset
