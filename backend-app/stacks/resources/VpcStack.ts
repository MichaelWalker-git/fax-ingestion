import { CfnParameter, Fn, Aws, RemovalPolicy } from 'aws-cdk-lib';
import { IVpc, Vpc, SubnetType, SecurityGroup, Port } from 'aws-cdk-lib/aws-ec2';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import { NestedStack } from 'aws-cdk-lib';

interface IProps {
  kmsKey: Key;
}

export class VpcStack extends NestedStack {
  public readonly vpc: IVpc;
  public readonly securityGroupStepFunctions: SecurityGroup;
  public readonly securityGroupAPI: SecurityGroup;
  public readonly securityGroupS3: SecurityGroup;
  public readonly securityGroupOpenSearch: SecurityGroup;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    const vpcIdParam = new CfnParameter(this, 'ExistingVpcId', {
      type: 'String',
      description: 'Optional: The ID of an existing VPC. Leave blank to create a new VPC.',
      default: '', // allows leaving it empty
    });

    const subnetIdsParam = new CfnParameter(this, 'PrivateSubnetIds', {
      type: 'List<AWS::EC2::Subnet::Id>',
      description: 'Optional: Comma-separated list of private subnet IDs in the existing VPC. Leave blank if creating a new VPC.',
      default: '',
    });

    // Choose between existing VPC or new one
    if (vpcIdParam.valueAsString !== '') {
      // Import existing VPC
      this.vpc = Vpc.fromVpcAttributes(this, 'ImportedVpc', {
        vpcId: vpcIdParam.valueAsString,
        availabilityZones: Fn.getAzs(Aws.REGION),
        privateSubnetIds: subnetIdsParam.valueAsList,
      });
    } else {
      // Create a new VPC
      this.vpc = new Vpc(this, 'NewVpc', {
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
          },
        ],
      });
    }

    // Create security groups (always created inside whichever VPC is active)
    this.securityGroupStepFunctions = this.createSecurityGroup('StepFunctions');
    this.securityGroupS3 = this.createSecurityGroup('S3');
    this.securityGroupAPI = this.createSecurityGroup('API');
    this.securityGroupOpenSearch = this.createSecurityGroup('OpenSearch');

    // Add ingress rule
    this.securityGroupOpenSearch.addIngressRule(
        this.securityGroupStepFunctions,
        Port.tcp(443),
        'Allow HTTPS from StepFunctions',
    );
  }

  private createSecurityGroup(name: string): SecurityGroup {
    return new SecurityGroup(this, `${name}SG`, {
      vpc: this.vpc,
      allowAllOutbound: true,
    });
  }
}
