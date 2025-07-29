import { Aspects, StackProps, Stage, Tags } from 'aws-cdk-lib';
import { AwsSolutionsChecks, HIPAASecurityChecks, NIST80053R5Checks, PCIDSS321Checks } from 'cdk-nag';
import { Construct } from 'constructs';
import { BackendAppStack } from './backend-app-stack';
import { Labels } from '../shared/labels';

const REGION = process.env.CDK_DEFAULT_REGION || '';

export interface StackInputs extends StackProps {
  labels: Labels;
  complianceFramework?: string;
}

export class MarketplaceStage extends Stage {
  public readonly backendAppStack: BackendAppStack;

  constructor(
    scope: Construct,
    id: string,
    args: StackInputs,
    props?: StackProps,
  ) {
    super(scope, id, props);

    this.backendAppStack = new BackendAppStack(
      this,
      args.labels.name(),
      args,
      {
        env: { region: REGION },
        description: 'AI-powered document processing platform with SageMaker integration - Marketplace Edition',
      },
    );

    // Apply comprehensive compliance checks based on configuration
    this.addComplianceChecks(args.complianceFramework);

    // Add marketplace-specific resource tags
    this.addMarketplaceResourceTags();
  }

  private addComplianceChecks(framework?: string): void {
    // Always apply AWS Solutions checks
    Aspects.of(this.backendAppStack).add(new AwsSolutionsChecks({ verbose: true }));

    // Apply additional compliance frameworks based on parameter
    switch (framework?.toLowerCase()) {
      case 'hipaa':
        Aspects.of(this.backendAppStack).add(new HIPAASecurityChecks({ verbose: true }));
        Tags.of(this).add('ComplianceFramework', 'HIPAA');
        break;

      case 'nist':
        Aspects.of(this.backendAppStack).add(new NIST80053R5Checks({ verbose: true }));
        Tags.of(this).add('ComplianceFramework', 'NIST-800-53-R5');
        break;

      case 'pci':
        Aspects.of(this.backendAppStack).add(new PCIDSS321Checks({ verbose: true }));
        Tags.of(this).add('ComplianceFramework', 'PCI-DSS-3.2.1');
        break;

      case 'all':
        // Apply all compliance frameworks for maximum security
        Aspects.of(this.backendAppStack).add(new HIPAASecurityChecks({ verbose: true }));
        Aspects.of(this.backendAppStack).add(new NIST80053R5Checks({ verbose: true }));
        Aspects.of(this.backendAppStack).add(new PCIDSS321Checks({ verbose: true }));
        Tags.of(this).add('ComplianceFramework', 'Multi-Framework');
        break;

      default:
        // Default to HIPAA for healthcare-related AI applications
        Aspects.of(this.backendAppStack).add(new HIPAASecurityChecks({ verbose: true }));
        Tags.of(this).add('ComplianceFramework', 'HIPAA-Default');
        break;
    }
  }

  private addMarketplaceResourceTags(): void {
    const commonTags = {
      'aws-marketplace:product': 'ai-document-processing-platform',
      'aws-marketplace:version': '1.0.0',
      'cost-center': 'marketplace-product',
      'environment': 'production',
      'auto-scaling': 'enabled',
      'backup-required': 'true',
      'monitoring-required': 'true',
    };

    Object.entries(commonTags).forEach(([key, value]) => {
      Tags.of(this.backendAppStack).add(key, value);
    });

    // Add component-specific tags
    Tags.of(this.backendAppStack).add('component:api-gateway', 'regional-endpoint');
    Tags.of(this.backendAppStack).add('component:sagemaker', 'ml-inference');
    Tags.of(this.backendAppStack).add('component:cognito', 'user-authentication');
    Tags.of(this.backendAppStack).add('component:s3', 'data-storage');
    Tags.of(this.backendAppStack).add('component:dynamodb', 'metadata-storage');
    Tags.of(this.backendAppStack).add('component:stepfunctions', 'workflow-orchestration');
    Tags.of(this.backendAppStack).add('component:vpc', 'network-isolation');
    Tags.of(this.backendAppStack).add('component:kms', 'encryption-at-rest');
  }

  /**
   * Get the main stack outputs for marketplace documentation
   */
  public getMarketplaceOutputs(): Record<string, string> {
    return {
      'Application Name': this.backendAppStack.stackName,
      'API Gateway URL': 'Available in CloudFormation outputs',
      'Cognito User Pool': 'Available in CloudFormation outputs',
      'S3 Buckets': 'Input and output buckets created',
      'SageMaker Endpoint': 'AI inference endpoint deployed',
      'VPC Configuration': 'Private subnets with NAT gateway',
      'Encryption': 'Customer-managed KMS keys',
      'Monitoring': 'CloudWatch and X-Ray enabled',
      'Compliance': 'Multiple frameworks supported',
    };
  }
}
