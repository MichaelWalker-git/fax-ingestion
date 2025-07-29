import { config } from 'dotenv';
config();

import * as cdk from 'aws-cdk-lib';
import { DevStage, ProdStage, TestStage } from '../lib/stages';
import { STAGES } from '../shared/constants';

const app = new cdk.App();

new DevStage(app, STAGES.dev);

new ProdStage(app, STAGES.prod);

new TestStage(app, STAGES.test);

app.synth();
