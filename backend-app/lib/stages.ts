import { Aspects, StackProps, Stage } from 'aws-cdk-lib';
import { AwsSolutionsChecks, HIPAASecurityChecks } from 'cdk-nag';
import { Construct } from 'constructs';
import { BackendAppStack } from './backend-app-stack';
import { Labels } from '../shared/labels';

const REGION = process.env.CDK_DEFAULT_REGION || '';


export interface StackInputs extends StackProps {
  labels: Labels;
}

export class DevStage extends Stage {
  constructor(scope: Construct,
    id: string,
    args: StackInputs,
    props?: StackProps,
  ) {
    super(scope, id, props);
    const backendAppStack = new BackendAppStack(
      this,
      args.labels.name(),
      args,
      {
        env: { region: REGION },
      });

    // Apply CDK Nag checks
    Aspects.of(backendAppStack).add(new AwsSolutionsChecks());
    Aspects.of(backendAppStack).add(new HIPAASecurityChecks());
  }
}


export class ProdStage extends Stage {
  constructor(scope: Construct,
    id: string,
    args: StackInputs,
    props?: StackProps,
  ) {
    super(scope, id, props);
    const backendAppStack = new BackendAppStack(
      this,
      args.labels.name(),
      args,
      {
        env: { region: REGION },
      });

    // Apply CDK Nag checks
    Aspects.of(backendAppStack).add(new AwsSolutionsChecks());
    Aspects.of(backendAppStack).add(new HIPAASecurityChecks());
  }
}


export class TestStage extends Stage {
  constructor(scope: Construct,
    id: string,
    args: StackInputs,
    props?: StackProps) {
    super(scope, id, props);
    const backendAppStack = new BackendAppStack(this,
      args.labels.name(),
      args,
      {
        env: { region: REGION },
      });

    // Apply CDK Nag checks
    Aspects.of(backendAppStack).add(new AwsSolutionsChecks());
    Aspects.of(backendAppStack).add(new HIPAASecurityChecks());
  }
}
