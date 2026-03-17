/**
 * Escalation Checker Lambda Handler (P0-5)
 * 
 * Triggered by EventBridge every 2 minutes.
 * Checks for emergency cases with notificationStatus = "pending_ack"
 * that have gone unacknowledged for more than 5 minutes.
 * 
 * For each unacknowledged case:
 *   1. Fetches the district health officer phone number from SSM Parameter Store
 *      at path: /doorstep-doctor/{district}/escalation-phone
 *   2. Publishes an SMS alert via SNS
 *   3. Updates notificationStatus to "escalated"
 */

import { ScheduledEvent, Context } from 'aws-lambda';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

import dynamoDBService from '../services/dynamodb.service';
import config from '../config/aws.config';
import logger from '../utils/logger';

const ssmClient = new SSMClient({ region: config.region });
const snsClient = new SNSClient({ region: config.region });

/**
 * Main handler — triggered by EventBridge rate(2 minutes)
 */
export async function handler(
    _event: ScheduledEvent,
    context: Context
): Promise<void> {
    const requestId = context.awsRequestId;
    logger.setContext({ requestId, handler: 'escalation-checker' });

    try {
        logger.info('Escalation checker triggered');

        // Query emergency cases with pending_ack status older than 5 minutes
        const pendingCases = await dynamoDBService.queryPendingEmergencies(5);

        if (pendingCases.length === 0) {
            logger.info('No unacknowledged emergency cases found');
            return;
        }

        logger.warn('Unacknowledged emergency cases found — escalating', {
            count: pendingCases.length
        });

        for (const emergencyCase of pendingCases) {
            try {
                const district = emergencyCase.location?.district || 'unknown';

                // Fetch the district health officer phone number from SSM
                const phoneNumber = await getEscalationPhone(district);

                if (!phoneNumber) {
                    logger.error('No escalation phone found for district', undefined, {
                        district,
                        emergencyId: emergencyCase.emergencyId
                    });
                    continue;
                }

                // Send SMS via SNS
                const message =
                    `URGENT: Emergency case ${emergencyCase.emergencyId} in ${district} ` +
                    `has been unacknowledged for >5 minutes. ` +
                    `Patient symptoms: ${emergencyCase.patientInfo?.symptoms || 'unknown'}. ` +
                    `Urgency: ${emergencyCase.urgencyLevel}. ` +
                    `Please acknowledge immediately via the PHC dashboard.`;

                await snsClient.send(
                    new PublishCommand({
                        PhoneNumber: phoneNumber,
                        Message: message,
                        MessageAttributes: {
                            'AWS.SNS.SMS.SMSType': {
                                DataType: 'String',
                                StringValue: 'Transactional'
                            }
                        }
                    })
                );

                // Update notification status to escalated
                await dynamoDBService.updateNotificationStatus(
                    emergencyCase.emergencyId,
                    'escalated'
                );

                logger.info('Emergency case escalated via SMS', {
                    emergencyId: emergencyCase.emergencyId,
                    district,
                    phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, '*') // Mask for logging
                });
            } catch (caseError) {
                // Process errors per-case so one failure doesn't stop other escalations
                logger.error('Failed to escalate individual case', caseError as Error, {
                    emergencyId: emergencyCase.emergencyId
                });
            }
        }

        logger.info('Escalation check complete', {
            totalChecked: pendingCases.length
        });
    } catch (error) {
        logger.error('Escalation checker failed', error as Error, { requestId });
        throw error;
    } finally {
        logger.clearContext();
    }
}

/**
 * Fetch district health officer escalation phone from SSM Parameter Store.
 * Path: /doorstep-doctor/{district}/escalation-phone
 * 
 * Phone numbers are stored in SSM, NOT hardcoded, per P0-5 requirement.
 * Returns null if the parameter does not exist for the district.
 */
async function getEscalationPhone(district: string): Promise<string | null> {
    try {
        const paramName = `/doorstep-doctor/${district}/escalation-phone`;

        const response = await ssmClient.send(
            new GetParameterCommand({
                Name: paramName,
                WithDecryption: true
            })
        );

        return response.Parameter?.Value || null;
    } catch (error) {
        logger.warn('SSM parameter not found for district escalation phone', {
            district,
            error: (error as Error).message
        });
        return null;
    }
}
