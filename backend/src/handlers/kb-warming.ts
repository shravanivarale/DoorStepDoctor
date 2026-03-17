import { BedrockAgentRuntimeClient, RetrieveCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

// Initialize clients outside handler for connection reuse
const bedrockAgentClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION });
const cloudwatchClient = new CloudWatchClient({ region: process.env.AWS_REGION });

const KNOWLEDGE_BASE_ID = process.env.BEDROCK_KNOWLEDGE_BASE_ID!;

async function emitMetric(metricName: string, value: number) {
    try {
        await cloudwatchClient.send(new PutMetricDataCommand({
            Namespace: 'ASHA-Triage',
            MetricData: [
                {
                    MetricName: metricName,
                    Value: value,
                    Unit: 'Count',
                    Timestamp: new Date()
                }
            ]
        }));
    } catch (error) {
        console.error(`Failed to emit metric ${metricName}`, error);
    }
}

export const handler = async (_event: any): Promise<void> => {
    console.log('Starting KB warm ping execution');

    try {
        const command = new RetrieveCommand({
            knowledgeBaseId: KNOWLEDGE_BASE_ID,
            retrievalQuery: {
                text: 'common symptoms fever cough headache'
            },
            retrievalConfiguration: {
                vectorSearchConfiguration: {
                    numberOfResults: 1
                }
            }
        });

        await bedrockAgentClient.send(command);

        // Discard the result, just emit success metric
        await emitMetric('kb_warm_ping_success', 1);
        console.log('KB warm ping successful');

    } catch (error) {
        console.error('KB warm ping failed', error);
        await emitMetric('kb_warm_ping_failure', 1);
        throw error;
    }
};
