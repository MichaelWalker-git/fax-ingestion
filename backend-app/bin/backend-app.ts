import { config } from 'dotenv';
config();

import * as cdk from 'aws-cdk-lib';
import { BackendAppStack } from '../lib/backend-app-stack';
import { Labels } from '../shared/labels';

const CDK_DEFAULT_REGION = process.env.CDK_DEFAULT_REGION || '';
const CDK_DEFAULT_ACCOUNT = process.env.CDK_DEFAULT_ACCOUNT || '';
const APP_NAME = process.env.APP_NAME || '';
const APP_LABEL = process.env.APP_LABEL || '';
const APP_REGION = 'ce2';

const app = new cdk.App();

const labels = new Labels(APP_LABEL, 'marketplace', APP_REGION, APP_NAME, 'private', '-');

// This is the stack we want as a Marketplace template
new BackendAppStack(app, 'MarketplaceStack', { labels }, {
  env: { region: CDK_DEFAULT_REGION, account: CDK_DEFAULT_ACCOUNT },
});

app.synth();
