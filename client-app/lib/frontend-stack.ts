import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {SiteCloudfront} from "./site-cloudfront.ts";

export interface FrontendStackProps extends cdk.StackProps {
  restApiEndpoint: string;
  awsRegion: string;
  awsUserPoolId: string;
  awsUserPoolClientId: string;
  awsCognitoIdentityPoolId: string;
  env: cdk.Environment;
  repository: string;
  branch: string;
  oauthToken: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    new SiteCloudfront(this, 'Site', props);

  }
}
