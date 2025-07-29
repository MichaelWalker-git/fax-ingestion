import { Aspects, StackProps, Stage } from 'aws-cdk-lib';
import { AwsSolutionsChecks, HIPAASecurityChecks } from 'cdk-nag';
import { Construct } from 'constructs';
import { BackendAppStack } from './backend-app-stack';
import { Labels } from '../shared/labels';


export interface StackInputs extends StackProps {
  labels: Labels;
}

export class DevStage extends Stage {
  constructor(scope: Construct,
    id: string,
  ) {
    super(scope, id);
    const backendAppStack = new BackendAppStack(
      this, 'Dev');

    // Apply CDK Nag checks
    Aspects.of(backendAppStack).add(new AwsSolutionsChecks());
    Aspects.of(backendAppStack).add(new HIPAASecurityChecks());
  }
}


export class ProdStage extends Stage {
  constructor(scope: Construct,
    id: string,
  ) {
    super(scope, id);
    const backendAppStack = new BackendAppStack(
      this, 'Prod');

    // Apply CDK Nag checks
    Aspects.of(backendAppStack).add(new AwsSolutionsChecks());
    Aspects.of(backendAppStack).add(new HIPAASecurityChecks());
  }
}


export class TestStage extends Stage {
  constructor(scope: Construct,
    id: string) {
    super(scope, id);
    const backendAppStack = new BackendAppStack(this,
      'Test');

    // Apply CDK Nag checks
    Aspects.of(backendAppStack).add(new AwsSolutionsChecks());
    Aspects.of(backendAppStack).add(new HIPAASecurityChecks());
  }
}
