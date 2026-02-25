/**
 * Authentication Lambda Handler
 *
 * Handles user authentication, registration, and token validation
 * for ASHA workers and PHC doctors.
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
/**
 * Login handler
 */
export declare function loginHandler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
/**
 * Registration handler
 */
export declare function registerHandler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
/**
 * Token validation handler
 */
export declare function validateTokenHandler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
/**
 * Confirm registration handler
 */
export declare function confirmRegistrationHandler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
//# sourceMappingURL=auth.handler.d.ts.map