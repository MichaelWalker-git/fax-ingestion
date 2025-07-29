import { CfnParameter, Fn, Aws, RemovalPolicy, NestedStack, CfnCondition } from 'aws-cdk-lib';
import { IVpc, Vpc, SubnetType, SecurityGroup, Port } from 'aws-cdk-lib/aws-ec2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Key } from 'aws-cdk-lib/aws-kms';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { createVpcCloudwatchLogs, getCdkConstructId } from '../../shared/helpers';

interface IProps {
  kmsKey: Key;
}

export class VpcStack extends NestedStack {
  public readonly removalPolicy = RemovalPolicy.DESTROY;
  public readonly kmsKey: Key;
  public readonly vpc: IVpc | Vpc;
  public readonly securityGroupStepFunctions: SecurityGroup;
  public readonly securityGroupAPI: SecurityGroup;
  public readonly securityGroupS3: SecurityGroup;
  public readonly securityGroupOpenSearch: SecurityGroup;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);
    this.kmsKey = props.kmsKey;

    const vpcIdParam = new CfnParameter(this, 'ExistingVpcId', {
      type: 'String',
      description: 'Optional: The ID of an existing VPC. Leave blank to create a new VPC.',
    });

    // Change this to String type instead of List
    const subnetIdsParam = new CfnParameter(this, 'PrivateSubnetIds', {
      type: 'String',
      description: 'Optional: Comma-separated list of private subnet IDs in the existing VPC. Leave blank if creating a new VPC.',
    });

    const vpcId = getCdkConstructId({ context: 'processing', resourceName: 'vpc' }, this);

    // Choose between existing VPC or new one
    const hasExistingVpc = new CfnCondition(this, 'HasExistingVpc', {
      expression: Fn.conditionNot(Fn.conditionEquals(vpcIdParam.valueAsString, '')),
    });

    if (Fn.conditionIf('HasExistingVpc', true, false).toString() === 'true') {
      const privateSubnetIds = Fn.split(',', subnetIdsParam.valueAsString)
        .map((subnetId: string) => subnetId.trim())
        .filter((subnetId: string) => subnetId !== '');

      if (privateSubnetIds.length === 0) {
        throw new Error('You must provide at least one PrivateSubnetId when using an ExistingVpcId.');
      }

      this.vpc = Vpc.fromVpcAttributes(this, 'ImportedVpc', {
        vpcId: vpcIdParam.valueAsString,
        availabilityZones: Fn.getAzs(Aws.REGION),
        privateSubnetIds,
      });
    } else {
      // Create a new VPC
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
        vpc: this.vpc as Vpc,
        kmsKey: this.kmsKey,
        removalPolicy: this.removalPolicy,
      });

      //CDK-Nag Suppressions
      this.addNagSuppressions(flowLogRole);
    }

    // Create security groups (always created inside whichever VPC is active)
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

    this.securityGroupOpenSearch.addIngressRule(
      this.securityGroupAPI,
      ec2.Port.tcp(443),
      'Allow API Lambdas to access OpenSearch over HTTPS',
    );

    // Add ingress rule
    this.securityGroupOpenSearch.addIngressRule(
      this.securityGroupStepFunctions,
      Port.tcp(443),
      'Allow HTTPS from StepFunctions',
    );
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
