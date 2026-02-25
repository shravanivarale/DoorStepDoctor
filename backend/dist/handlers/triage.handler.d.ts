/**
 * Triage Lambda Handler
 *
 * Main API endpoint for processing triage requests from ASHA workers.
 * Orchestrates the complete triage pipeline: RAG retrieval + Claude inference + DynamoDB storage
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
/**
 * Main triage handler
 *
 * @param event - API Gateway event
 * @param context - Lambda context
 * @returns API Gateway response
 */
export declare function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
//# sourceMappingURL=triage.handler.d.ts.map