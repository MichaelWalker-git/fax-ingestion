#!/usr/bin/env node
import { config } from 'dotenv';
config();

import * as cdk from 'aws-cdk-lib';
import { ProdStage } from '../lib/stages';
import { STAGES } from '../shared/constants';
import { Labels } from '../shared/labels';

// Environment variables with defaults for marketplace deployment
const CDK_DEFAULT_REGION = process.env.CDK_DEFAULT_REGION || 'us-east-1';
const CDK_DEFAULT_ACCOUNT = process.env.CDK_DEFAULT_ACCOUNT || '';
const APP_NAME = process.env.APP_NAME || 'ai-document-processor';
const APP_LABEL = process.env.APP_LABEL || 'AiDocProcessor';
const APP_REGION = process.env.APP_REGION || 'eu-central-1';
const COMPLIANCE_FRAMEWORK = process.env.COMPLIANCE_FRAMEWORK || 'hipaa';

// Marketplace-specific configuration
const MARKETPLACE_VERSION = process.env.MARKETPLACE_VERSION || '1.0.0';
const VENDOR_NAME = process.env.VENDOR_NAME || 'Horustech';

const app = new cdk.App();

// Create labels for the marketplace deployment
const labels = new Labels(
  APP_LABEL,
  STAGES.prod,
  APP_REGION,
  APP_NAME,
  'marketplace',
  '-',
);

const prodProps = {
  labels,
  complianceFramework: COMPLIANCE_FRAMEWORK,
  description: `AI Document Processing Platform v${MARKETPLACE_VERSION} - AWS Marketplace Edition`,
  env: {
    region: CDK_DEFAULT_REGION,
    account: CDK_DEFAULT_ACCOUNT,
  },
};

// Add marketplace-specific metadata
app.node.setContext('@aws-cdk/core:enableStackVersionCreation', true);
app.node.setContext('@aws-cdk/core:enableDependencyDetection', true);
app.node.setContext('@aws-cdk/aws-lambda:recognizeVersionProps', true);
app.node.setContext('@aws-cdk/aws-cloudfront:defaultSecurityPolicyTLSv1.2_2021', true);
app.node.setContext('@aws-cdk/aws-apigateway:usagePlanKeyOrderInsensitiveId', true);

// Add marketplace product information as context
app.node.setContext('marketplace:version', MARKETPLACE_VERSION);
app.node.setContext('marketplace:vendor', VENDOR_NAME);
app.node.setContext('marketplace:supportEmail', process.env.SUPPORT_EMAIL || 'support@your-company.com');
app.node.setContext('marketplace:documentationUrl', process.env.DOCS_URL || 'https://docs.your-company.com');

// Deploy the marketplace stage
new ProdStage(
  app,
  STAGES.prod,
  prodProps,
  {
    env: { region: CDK_DEFAULT_REGION, account: CDK_DEFAULT_ACCOUNT },
  },
);


// Synthesize the CloudFormation templates
app.synth();

// Log deployment information
console.log('🚀 Marketplace CloudFormation Template Generation Complete!');
console.log('🏷️  Version:', MARKETPLACE_VERSION);
console.log('🌍 Region:', CDK_DEFAULT_REGION);
console.log('🏢 Vendor:', VENDOR_NAME);
console.log('🔒 Compliance:', COMPLIANCE_FRAMEWORK.toUpperCase());
console.log('📁 Output Directory: cdk.out/');
