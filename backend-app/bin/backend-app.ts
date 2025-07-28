import { config } from 'dotenv';
config();

import * as cdk from 'aws-cdk-lib';
import { DevStage, ProdStage, TestStage } from '../lib/stages';
import { STAGES } from '../shared/constants';
import { Labels } from '../shared/labels';

const CDK_DEFAULT_REGION = process.env.CDK_DEFAULT_REGION || '';
const CDK_DEFAULT_ACCOUNT = process.env.CDK_DEFAULT_ACCOUNT || '';
const APP_NAME = process.env.APP_NAME || '';
const APP_LABEL = process.env.APP_LABEL || '';
const APP_REGION = 'ce2';

const app = new cdk.App();

const devLabels = new Labels(APP_LABEL, STAGES.dev, APP_REGION, APP_NAME, 'private', '-');
new DevStage(app,
  STAGES.dev,
  { labels: devLabels },
  { env: { region: CDK_DEFAULT_REGION, account: CDK_DEFAULT_ACCOUNT } },
);

const prdLabels = new Labels(APP_LABEL, STAGES.prod, APP_REGION, APP_NAME, 'private', '-');
new ProdStage(app,
  STAGES.prod,
  { labels: prdLabels },
  { env: { region: CDK_DEFAULT_REGION, account: CDK_DEFAULT_ACCOUNT } },
);

const testLabels = new Labels(APP_LABEL, STAGES.test, APP_REGION, APP_NAME, 'private', '-');
new TestStage(app, STAGES.test,
  { labels: testLabels },
  { env: { region: CDK_DEFAULT_REGION, account: CDK_DEFAULT_ACCOUNT } },
);

app.synth();
