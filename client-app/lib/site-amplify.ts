import { Construct } from 'constructs';
import { CfnOutput, Stack, StackProps, SecretValue } from 'aws-cdk-lib';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as customResource from 'aws-cdk-lib/custom-resources';

export interface FrontendStackProps extends StackProps {
    repository: string;
    branch: string;
    oauthToken: string;
    awsUserPoolClientId: string;
    awsUserPoolId: string;
    awsCognitoIdentityPoolId: string;
    restApiEndpoint: string;
}

export class SiteAmplify extends Stack {
    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, props);

        const amplifyApp = new amplify.App(this, 'AmplifyApp', {
            appName: 'IdpFrontendApp',
            sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
                owner: 'MichaelWalker-git',
                repository: props.repository,
                oauthToken: SecretValue.unsafePlainText(props.oauthToken),
            }),
            buildSpec: codebuild.BuildSpec.fromObjectToYaml({
                version: '1.0',
                frontend: {
                    phases: {
                        preBuild: {
                            commands: ['cd client-app/site', 'npm install --legacy-peer-deps'],
                        },
                        build: {
                            commands: ['npm run build'],
                        },
                    },
                    artifacts: {
                        baseDirectory: 'client-app/site/dist',
                        files: ['**/*'],
                    },
                    cache: {
                        paths: ['node_modules/**/*'],
                    },
                },
            }),
            environmentVariables: {
                VITE_USER_POOL_CLIENT_ID: props.awsUserPoolClientId,
                VITE_USER_POOL_ID: props.awsUserPoolId,
                VITE_IDENTITY_POOL_ID: props.awsCognitoIdentityPoolId,
                VITE_API_ENDPOINT: props.restApiEndpoint,
            },
        });

        const branch = amplifyApp.addBranch(props.branch, {
            autoBuild: true,
        });

        new customResource.AwsCustomResource(this, 'triggerAppBuild', {
            policy: customResource.AwsCustomResourcePolicy.fromSdkCalls({
                resources: customResource.AwsCustomResourcePolicy.ANY_RESOURCE
            }),
            onCreate: {
                service: 'Amplify',
                action: 'startJob',
                physicalResourceId: customResource.PhysicalResourceId.of('app-build-trigger'),
                parameters: {
                    appId: amplifyApp.appId,
                    branchName: props.branch,
                    jobType: 'RELEASE',
                    jobReason: 'Auto Start build',
                }
            },
        });

        new CfnOutput(this, 'AmplifyAppUrl', {
            value: `https://${branch.branchName}.${amplifyApp.defaultDomain}`,
            description: 'Amplify App URL',
        });
    }
}
