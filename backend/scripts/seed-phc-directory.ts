/**
 * Seed Script: asha-phc-directory DynamoDB Table (P0-6)
 * 
 * Populates the PHC directory table with representative records.
 * In production, this data should be sourced from the NHM PHC registry at nhm.gov.in
 * 
 * Usage:
 *   npx ts-node scripts/seed-phc-directory.ts
 * 
 * Prerequisites:
 *   - AWS credentials configured
 *   - asha-phc-directory table already created (via SAM/CloudFormation)
 */

import {
    DynamoDBClient,
    PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.DYNAMODB_PHC_DIRECTORY_TABLE || 'asha-phc-directory';

const client = new DynamoDBClient({ region: REGION });

/**
 * Representative PHC records for seeding.
 * 
 * Production data source: NHM PHC registry at nhm.gov.in
 * These records cover different states and districts to demonstrate
 * the district-state-index GSI query pattern.
 */
const PHC_RECORDS = [
    {
        phcId: 'phc-mh-pune-001',
        name: 'Baramati Primary Health Center',
        district: 'Pune',
        state: 'Maharashtra',
        latitude: 18.1554,
        longitude: 74.5815,
        phoneNumber: '+912112232001',
        geohash: 'tep4'
    },
    {
        phcId: 'phc-mh-pune-002',
        name: 'Junnar Primary Health Center',
        district: 'Pune',
        state: 'Maharashtra',
        latitude: 19.2094,
        longitude: 73.8770,
        phoneNumber: '+912132234502',
        geohash: 'tep8'
    },
    {
        phcId: 'phc-rj-jaipur-001',
        name: 'Amber Primary Health Center',
        district: 'Jaipur',
        state: 'Rajasthan',
        latitude: 26.9855,
        longitude: 75.8513,
        phoneNumber: '+911412637001',
        geohash: 'tss4'
    },
    {
        phcId: 'phc-tn-madurai-001',
        name: 'Melur Primary Health Center',
        district: 'Madurai',
        state: 'Tamil Nadu',
        latitude: 10.0320,
        longitude: 78.3392,
        phoneNumber: '+914522620301',
        geohash: 'tfr2'
    },
    {
        phcId: 'phc-up-lucknow-001',
        name: 'Mohanlalganj Primary Health Center',
        district: 'Lucknow',
        state: 'Uttar Pradesh',
        latitude: 26.7481,
        longitude: 80.9746,
        phoneNumber: '+915222781001',
        geohash: 'tuq6'
    }
];

async function seed(): Promise<void> {
    console.log(`Seeding ${PHC_RECORDS.length} PHC records into ${TABLE_NAME}...`);

    for (const record of PHC_RECORDS) {
        try {
            await client.send(
                new PutItemCommand({
                    TableName: TABLE_NAME,
                    Item: marshall(record, { removeUndefinedValues: true })
                })
            );
            console.log(`  ✓ ${record.name} (${record.district}, ${record.state})`);
        } catch (error) {
            console.error(`  ✗ Failed to seed ${record.phcId}:`, (error as Error).message);
        }
    }

    console.log('Seed complete.');
}

seed().catch(console.error);
