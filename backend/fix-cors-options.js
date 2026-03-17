#!/usr/bin/env node

/**
 * Fix CORS OPTIONS Methods
 * 
 * This script removes authentication from OPTIONS methods in API Gateway
 * to allow CORS preflight requests to succeed.
 * 
 * Run this after each SAM deployment:
 * node fix-cors-options.js
 */

const { execSync } = require('child_process');

const API_ID = 'mrl5y4bb52';
const STAGE = 'development';

console.log('🔧 Fixing CORS OPTIONS methods...\n');

// Get all resources
console.log('📋 Getting API resources...');
const resourcesJson = execSync(
  `aws apigateway get-resources --rest-api-id ${API_ID}`,
  { encoding: 'utf-8' }
);
const resources = JSON.parse(resourcesJson);

// Find all resources with OPTIONS methods
const optionsResources = resources.items.filter(resource => 
  resource.resourceMethods && resource.resourceMethods.OPTIONS
);

console.log(`Found ${optionsResources.length} resources with OPTIONS methods\n`);

let fixed = 0;
let errors = 0;

// Fix each OPTIONS method
for (const resource of optionsResources) {
  try {
    console.log(`Fixing: ${resource.path}`);
    
    // Check current auth type
    const methodJson = execSync(
      `aws apigateway get-method --rest-api-id ${API_ID} --resource-id ${resource.id} --http-method OPTIONS`,
      { encoding: 'utf-8' }
    );
    const method = JSON.parse(methodJson);
    
    if (method.authorizationType !== 'NONE') {
      console.log(`  Current auth: ${method.authorizationType}`);
      
      // Update to NONE
      execSync(
        `aws apigateway update-method --rest-api-id ${API_ID} --resource-id ${resource.id} --http-method OPTIONS --patch-operations op=replace,path=/authorizationType,value=NONE`,
        { encoding: 'utf-8' }
      );
      
      console.log(`  ✅ Fixed: ${resource.path}`);
      fixed++;
    } else {
      console.log(`  ✓ Already correct: ${resource.path}`);
    }
  } catch (error) {
    console.error(`  ❌ Error fixing ${resource.path}:`, error.message);
    errors++;
  }
}

// Deploy changes if any were made
if (fixed > 0) {
  console.log(`\n📦 Deploying changes to ${STAGE} stage...`);
  try {
    execSync(
      `aws apigateway create-deployment --rest-api-id ${API_ID} --stage-name ${STAGE} --description "Fix CORS - Remove auth from OPTIONS methods"`,
      { encoding: 'utf-8' }
    );
    console.log('✅ Deployment successful!');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    errors++;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('Summary:');
console.log(`  Fixed: ${fixed}`);
console.log(`  Errors: ${errors}`);
console.log(`  Total OPTIONS methods: ${optionsResources.length}`);
console.log('='.repeat(50));

if (errors === 0) {
  console.log('\n✅ All CORS OPTIONS methods are now configured correctly!');
  console.log('\nNext steps:');
  console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
  console.log('2. Restart frontend (npm start)');
  console.log('3. Try to login - CORS errors should be gone!');
} else {
  console.log('\n⚠️  Some errors occurred. Please check the output above.');
  process.exit(1);
}
