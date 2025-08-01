import { Aws, CustomResource, Fn, NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import {
  AccountRecovery,
  CfnIdentityPool, CfnIdentityPoolRoleAttachment,
  Mfa, StringAttribute,
  UserPool,
  UserPoolClient,
  UserPoolDomain,
} from 'aws-cdk-lib/aws-cognito';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { createSuperAdminUser } from '../../resources/lambda/adminPanel/createSuperAdminUser';
import { USER_ROLES } from '../../shared/constants';
import { createDefaultLambdaRole, getCdkConstructId, getPolicyStatement } from '../../shared/helpers';
import { Labels } from '../../shared/labels';

interface IProps {
  vpc: IVpc;
  inputBucket: IBucket;
  outputBucket: IBucket;
  kmsKey: Key;
  labels: Labels;
}

export class CognitoStack extends NestedStack {
  public readonly removalPolicy: RemovalPolicy = RemovalPolicy.RETAIN;
  public readonly kmsKey: Key;
  public readonly userPool: UserPool;
  public readonly userPoolDomain: UserPoolDomain;
  public readonly cognitoClient: UserPoolClient;
  public readonly identityPool: CfnIdentityPool;
  public readonly authenticatedRole: iam.Role;
  public readonly clientUrl: string;
  public readonly inputBucket: IBucket;
  public readonly vpc: IVpc;
  public readonly outputBucket: IBucket;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    this.kmsKey = props.kmsKey;
    this.inputBucket = props.inputBucket;
    this.outputBucket = props.outputBucket;
    this.vpc = props.vpc;

    this.clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL : 'http://localhost:5173/';

    // Cognito
    const cognitoUserPoolName = getCdkConstructId({ context: 'cognito', resourceName: 'user-pool' }, this);
    this.userPool = new UserPool(this, cognitoUserPoolName, {
      userPoolName: cognitoUserPoolName,
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
        familyName: {
          required: false,
          mutable: true,
        },
        givenName: {
          required: false,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
      },
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: false,
        otp: true,
      },
      signInAliases: {
        email: true,
        username: true,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 14,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: true,
        requireSymbols: true,
      },
      customAttributes: {
        companyName: new StringAttribute({ mutable: false }),
        companyId: new StringAttribute({ mutable: false }),
        userRole: new StringAttribute({ mutable: true }), // SUPER_ADMIN, ADMIN, USER
        userId: new StringAttribute({ mutable: true }),
        createdById: new StringAttribute({ mutable: false }),
        createdByName: new StringAttribute({ mutable: false }),
        createdByRole: new StringAttribute({ mutable: false }),
        createdAt: new StringAttribute({ mutable: false }),
        tenantId: new StringAttribute({ mutable: false }),
      },
      customSenderKmsKey: this.kmsKey,
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      removalPolicy: this.removalPolicy,
      selfSignUpEnabled: false,
    });

    const uniqueStackIdPart = Fn.select(2, Fn.split('/', `${Aws.STACK_ID}`));
    this.userPoolDomain = this.userPool.addDomain(getCdkConstructId({ context: 'cognito', resourceName: 'pool-domain' }, this), {
      cognitoDomain: {
        domainPrefix: uniqueStackIdPart,
      },
    });

    this.cognitoClient = this.userPool.addClient(getCdkConstructId({ context: 'cognito', resourceName: 'client' }, this), {
      generateSecret: false,
      oAuth: {
        callbackUrls: [this.clientUrl],
        logoutUrls: [this.clientUrl],
      },
    });

    this.identityPool = new CfnIdentityPool(this, getCdkConstructId({ context: 'cognito', resourceName: 'identity-pool' }, this), {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: this.cognitoClient.userPoolClientId,
        providerName: `cognito-idp.${this.region}.amazonaws.com/${this.userPool.userPoolId}`,
      }],
    });

    this.authenticatedRole = new iam.Role(this, getCdkConstructId({ context: 'cognito', resourceName: 'authenticated-role' }, this), {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          'StringEquals': { 'cognito-identity.amazonaws.com:aud': this.identityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    new CfnIdentityPoolRoleAttachment(this, getCdkConstructId({ context: 'cognito', resourceName: 'identity-pool-role' }, this), {
      identityPoolId: this.identityPool.ref,
      roles: {
        authenticated: this.authenticatedRole.roleArn,
        unauthenticated: this.authenticatedRole.roleArn,
      },
    });

    this.authenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          's3:PutObject',
          's3:PutObjectAcl',
        ],
        resources: [`${this.inputBucket.bucketArn}`, `${this.inputBucket.bucketArn}/*`],
      }),
    );

    // Create a dedicated security group for the Lambda
    const securityGroup = new SecurityGroup(scope, getCdkConstructId({ context: 'cognito', resourceName: 'security-group' }, this), {
      vpc: this.vpc,
      allowAllOutbound: true,
    });

    const createAdminUserLambdaRole = createDefaultLambdaRole(this, getCdkConstructId({ context: 'create-admin-user', resourceName: 'lambda-role' }, this));
    const createAdminUserStatement = getPolicyStatement({
      service: 'cognito-idp',
      operations: ['AdminCreateUser', 'AdminAddUserToGroup'],
      resources: [this.userPool.userPoolArn],
    });

    createAdminUserLambdaRole.addToPolicy(createAdminUserStatement);

    const createAdminUserLambda = createSuperAdminUser(this, {}, createAdminUserLambdaRole, this.vpc, securityGroup);

    const customResourceProviderRole = createDefaultLambdaRole(this, 'customResourceProviderRole');
    const customResourceProvider = new Provider(this, getCdkConstructId({ context: 'cognito', resourceName: 'custom-resource-provider' }, this), {
      onEventHandler: createAdminUserLambda,
      vpc: this.vpc,
      role: customResourceProviderRole,
      securityGroups: [securityGroup],
    });

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    const customResource = new CustomResource(this, getCdkConstructId({ context: 'cognito', resourceName: 'custom-resource' }, this), {
      serviceToken: customResourceProvider.serviceToken,
      properties: {
        UserPoolId: this.userPool.userPoolId,
        FamilyName: process.env.ADMIN_FAMILY_NAME || 'Admin',
        GivenName: process.env.ADMIN_GIVEN_NAME || 'Super',
        Email: adminEmail,
        UserRole: USER_ROLES.SUPER_ADMIN,
        UpdateTimestamp: Date.now(),
        CreatedByName: 'System',
        CreatedByRole: 'System',
      },
    });

    customResource.node.addDependency(this.userPool);
    customResource.node.addDependency(createAdminUserLambda);

    // Outputs - Exports handled by main stack to avoid duplicates

    // Nag Suppressions
    // VPC
    NagSuppressions.addResourceSuppressions(
      [this.vpc],
      [{ id: 'HIPAA.Security-VPCNoUnrestrictedRouteToIGW', reason: 'Public subnet' }],
      true,
    );

    // Lambda
    NagSuppressions.addResourceSuppressions(
      [
        createAdminUserLambda,
        customResourceProvider,
      ],
      [{ id: 'HIPAA.Security-LambdaDLQ', reason: 'Lambda functions used in this solution are synchronous, DQL is not needed' }],
      true,
    );

    NagSuppressions.addResourceSuppressions(
      [customResourceProvider],
      [
        { id: 'HIPAA.Security-LambdaConcurrency', reason: 'Raised on a custom Lambda not created by our template' },
        { id: 'AwsSolutions-L1', reason: 'Raised on a custom Lambda not created by our template' },
      ],
      true,
    );

    // IAM Roles
    NagSuppressions.addResourceSuppressions(
      [
        createAdminUserLambdaRole,
        this.authenticatedRole,
        customResourceProviderRole,
      ],
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: '* is used so that the Lambda function can create log groups',
        },
        {
          id: 'HIPAA.Security-IAMNoInlinePolicy',
          reason: 'Inline policies are part of the BucketHandlerNotification',
        },
        {
          id: 'AwsSolutions-IAM4',
          reason: 'these policies is used by CDK Customer Resource lambda',
        },
      ],
      true,
    );

    // Cognito
    NagSuppressions.addResourceSuppressions(
      [
        this.userPool,
      ],
      [
        {
          id: 'AwsSolutions-COG1',
          reason: 'Local users not enabled by admin',
        },
        {
          id: 'AwsSolutions-COG3',
          reason: 'This is too expensive for the demo',
        },
      ],
      true,
    );
  }
}
