/**
 * Triage Service Usage Example
 * 
 * Demonstrates how to use the AI Triage Engine services.
 * This is for reference and testing purposes.
 */

import { bedrockService } from '../services/bedrock.service';
import { dynamoDBService } from '../services/dynamodb.service';
import { emergencyService } from '../services/emergency.service';
import { voiceService } from '../services/voice.service';
import { TriageRequest, TriageResult } from '../types/triage.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Example 1: Basic Triage Request
 */
async function basicTriageExample() {
  console.log('\n=== Example 1: Basic Triage Request ===\n');
  
  const triageRequest: TriageRequest = {
    userId: uuidv4(),
    symptoms: 'Patient has high fever (102°F) for 2 days, body ache, and headache',
    language: 'hi-IN',
    patientAge: 35,
    patientGender: 'female',
    location: {
      district: 'Pune',
      state: 'Maharashtra'
    },
    voiceInput: false,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Perform triage
    const { response, ragContext, processingTimeMs } = await bedrockService.performTriage(
      triageRequest
    );
    
    console.log('Triage Response:');
    console.log(`- Urgency Level: ${response.urgencyLevel}`);
    console.log(`- Risk Score: ${(response.riskScore * 100).toFixed(0)}%`);
    console.log(`- Recommended Action: ${response.recommendedAction}`);
    console.log(`- Refer to PHC: ${response.referToPhc ? 'Yes' : 'No'}`);
    console.log(`- Confidence: ${(response.confidenceScore * 100).toFixed(0)}%`);
    console.log(`- Processing Time: ${processingTimeMs}ms`);
    console.log(`- Documents Retrieved: ${ragContext.totalDocuments}`);
    
    // Create triage result
    const triageResult: TriageResult = {
      triageId: uuidv4(),
      request: triageRequest,
      response,
      metadata: {
        processingTimeMs,
        bedrockTokensUsed: 0,
        guardrailsTriggered: false,
        retrievedDocuments: ragContext.totalDocuments,
        modelVersion: 'anthropic.claude-3-haiku-20240307-v1:0',
        timestamp: new Date().toISOString()
      }
    };
    
    // Store in DynamoDB
    await dynamoDBService.storeTriageResult(triageResult);
    console.log(`\nTriage result stored with ID: ${triageResult.triageId}`);
    
  } catch (error) {
    console.error('Triage failed:', error);
  }
}

/**
 * Example 2: Emergency Escalation
 */
async function emergencyEscalationExample() {
  console.log('\n=== Example 2: Emergency Escalation ===\n');
  
  const triageRequest: TriageRequest = {
    userId: uuidv4(),
    symptoms: 'Patient has severe chest pain, difficulty breathing, and sweating',
    language: 'hi-IN',
    patientAge: 55,
    patientGender: 'male',
    location: {
      district: 'Mumbai',
      state: 'Maharashtra',
      latitude: 19.0760,
      longitude: 72.8777
    },
    voiceInput: false,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Perform triage
    const { response, ragContext, processingTimeMs } = await bedrockService.performTriage(
      triageRequest
    );
    
    const triageResult: TriageResult = {
      triageId: uuidv4(),
      request: triageRequest,
      response,
      metadata: {
        processingTimeMs,
        bedrockTokensUsed: 0,
        guardrailsTriggered: false,
        retrievedDocuments: ragContext.totalDocuments,
        modelVersion: 'anthropic.claude-3-haiku-20240307-v1:0',
        timestamp: new Date().toISOString()
      }
    };
    
    // Check if emergency escalation needed
    if (emergencyService.shouldEscalate(triageResult)) {
      console.log('⚠️  EMERGENCY DETECTED - Escalating to PHC');
      
      const escalation = await emergencyService.processEmergency(triageResult);
      
      console.log('\nEmergency Escalation:');
      console.log(`- Nearest PHC: ${escalation.nearestPhc.name}`);
      console.log(`- Distance: ${escalation.nearestPhc.distance.toFixed(1)} km`);
      console.log(`- Contact: ${escalation.nearestPhc.contact}`);
      console.log(`- Notification Sent: ${escalation.notificationSent ? 'Yes' : 'No'}`);
      console.log('\nReferral Note:');
      console.log(escalation.referralNote);
    }
    
  } catch (error) {
    console.error('Emergency escalation failed:', error);
  }
}

/**
 * Example 3: Voice Processing
 */
async function voiceProcessingExample() {
  console.log('\n=== Example 3: Voice Processing ===\n');
  
  try {
    // Text to speech
    const text = 'मरीज को बुखार है और खांसी है। कृपया PHC में जाएं।';
    console.log('Converting text to speech (Hindi)...');
    
    const audioBuffer = await voiceService.textToSpeech(text, 'hi-IN');
    console.log(`Audio generated: ${audioBuffer.length} bytes`);
    
    // Speech to text (requires S3 audio file)
    // const audioS3Uri = 's3://bucket/audio.wav';
    // const transcription = await voiceService.speechToText(audioS3Uri, 'hi-IN');
    // console.log(`Transcription: ${transcription.transcription}`);
    
  } catch (error) {
    console.error('Voice processing failed:', error);
  }
}

/**
 * Example 4: User Authentication
 */
async function authenticationExample() {
  console.log('\n=== Example 4: User Authentication ===\n');
  
  try {
    // Register new ASHA worker
    // Note: Uncomment when Cognito is configured
    /*
    const registrationData = {
      username: 'asha_worker_001',
      password: 'SecurePassword123!',
      email: 'asha001@example.com',
      phoneNumber: '+919876543210',
      role: 'asha_worker' as const,
      district: 'Pune',
      state: 'Maharashtra',
      assignedPhc: 'PHC_Pune_Central'
    };
    */
    
    console.log('Registering new ASHA worker...');
    // const userId = await authService.register(registrationData);
    // console.log(`User registered with ID: ${userId}`);
    
    // Login
    console.log('\nLogging in...');
    // const session = await authService.login({
    //   username: 'asha_worker_001',
    //   password: 'SecurePassword123!'
    // });
    // console.log(`Login successful for: ${session.name}`);
    // console.log(`Role: ${session.role}`);
    // console.log(`District: ${session.district}`);
    
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}

/**
 * Example 5: Query Triage History
 */
async function queryHistoryExample() {
  console.log('\n=== Example 5: Query Triage History ===\n');
  
  const userId = 'example-user-id';
  
  try {
    const history = await dynamoDBService.getUserTriageHistory(userId, 5);
    
    console.log(`Found ${history.length} triage records for user ${userId}`);
    
    history.forEach((record, index) => {
      console.log(`\n${index + 1}. Triage ID: ${record.triageId}`);
      console.log(`   Urgency: ${record.response.urgencyLevel}`);
      console.log(`   Risk Score: ${(record.response.riskScore * 100).toFixed(0)}%`);
      console.log(`   Date: ${record.request.timestamp}`);
    });
    
  } catch (error) {
    console.error('Query failed:', error);
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   AI Triage Engine - Service Usage Examples           ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  // Note: These examples require AWS credentials and configured services
  // Uncomment to run specific examples
  
  // await basicTriageExample();
  // await emergencyEscalationExample();
  // await voiceProcessingExample();
  // await authenticationExample();
  // await queryHistoryExample();
  
  console.log('\n✅ Examples completed\n');
}

// Run if executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export {
  basicTriageExample,
  emergencyEscalationExample,
  voiceProcessingExample,
  authenticationExample,
  queryHistoryExample
};
