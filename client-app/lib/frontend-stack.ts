import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {SiteAmplify} from "./site-amplify.ts";

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

    new SiteAmplify(this, 'Site', props);

  }
}
