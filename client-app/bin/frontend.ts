#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();
new FrontendStack(app, 'FrontendStack', {
  env: {
    region: process.env.AWS_REGION!,
  },
  awsRegion: process.env.AWS_REGION!,
  restApiEndpoint: process.env.API_ENDPOINT!,
  awsUserPoolId: process.env.USER_POOL_ID!,
  awsUserPoolClientId: process.env.USER_POOL_CLIENT_ID!,
  awsCognitoIdentityPoolId: process.env.IDENTITY_POOL_ID!,
  repository: process.env.GIT_REPOSITORY!,
  branch: process.env.GIT_BRANCH!,
  oauthToken: process.env.GIT_OAUTH_TOKEN!
});
