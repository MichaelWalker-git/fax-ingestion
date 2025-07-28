import { NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Key } from 'aws-cdk-lib/aws-kms';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { createVpcCloudwatchLogs, getCdkConstructId } from '../../shared/helpers';

interface IProps {
  kmsKey: Key;
}

export class VpcStack extends NestedStack {
  public readonly removalPolicy = RemovalPolicy.DESTROY;
  public readonly vpc: Vpc;
  public readonly kmsKey: Key;
  public readonly securityGroupStepFunctions: SecurityGroup;
  public readonly securityGroupAPI: SecurityGroup;
  public readonly securityGroupS3: SecurityGroup;
  public readonly securityGroupOpenSearch: SecurityGroup;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);
    this.kmsKey = props.kmsKey;

    const vpcId = getCdkConstructId({ context: 'processing', resourceName: 'vpc' }, this);

    this.vpc = new Vpc(this, vpcId, {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          name: 'PrivateSubnet',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'PublicSubnet',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
          mapPublicIpOnLaunch: false,
        },
      ],
    });

    // Skip VPC flow logs for existing VPC (may already be configured)
    const { flowLog, flowLogRole } = createVpcCloudwatchLogs({
      scope: this,
      vpc: this.vpc,
      kmsKey: this.kmsKey,
      removalPolicy: this.removalPolicy,
    });

    // Security Groups
    this.securityGroupStepFunctions = this.createSecurityGroup('StepFunctions');
    this.securityGroupS3 = this.createSecurityGroup('S3');
    this.securityGroupAPI = this.createSecurityGroup('API');
    this.securityGroupOpenSearch = this.createSecurityGroup('OpenSearch');

    // Add Ingress Rules
    this.securityGroupOpenSearch.addIngressRule(
      this.securityGroupStepFunctions,
      Port.tcp(443),
      'Allow HTTPS traffic from Lambda',
    );

    //CDK-Nag Suppressions
    this.addNagSuppressions(flowLogRole);flowLogRole;
  }

  private createSecurityGroup(name: string): SecurityGroup {
    return new SecurityGroup(this, getCdkConstructId({ context: name, resourceName: 'security-group' }, this), {
      vpc: this.vpc,
      allowAllOutbound: true,
    });
  }

  private addNagSuppressions(flowLogRole: Construct): void {
    NagSuppressions.addResourceSuppressions(
      [this.vpc],
      [
        {
          id: 'HIPAA.Security-VPCNoUnrestrictedRouteToIGW',
          reason: 'Public subnet is intended and controlled',
        },
      ],
      true,
    );

    NagSuppressions.addResourceSuppressions(
      [flowLogRole],
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: '* is used so Lambda can create log groups across services',
        },
        {
          id: 'HIPAA.Security-IAMNoInlinePolicy',
          reason: 'Inline policies are acceptable for short-lived roles like bucket handlers',
        },
        {
          id: 'AwsSolutions-IAM4',
          reason: 'AWS-managed policies are used by CDK custom resource lambdas',
        },
      ],
      true,
    );
  }
}
