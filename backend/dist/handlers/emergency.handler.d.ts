/**
 * Emergency Escalation Lambda Handler
 *
 * Handles emergency case management, PHC notifications,
 * and emergency queue queries for PHC dashboard.
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
/**
 * Get emergency cases for PHC dashboard
 */
export declare function getEmergencyCasesHandler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
/**
 * Update emergency case status
 */
export declare function updateEmergencyStatusHandler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
/**
 * Get emergency contact information
 */
export declare function getEmergencyContactHandler(_event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
//# sourceMappingURL=emergency.handler.d.ts.map