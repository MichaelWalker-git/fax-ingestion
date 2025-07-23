import {
  TokenAuthorizer,
  RestApi,
  IRestApi,
  IResource,
  Method,
  Model,
  LambdaIntegration,
  AuthorizationType,
  MethodOptions,
  MockIntegration,
  PassthroughBehavior,
  ContentHandling, IAuthorizer,
} from 'aws-cdk-lib/aws-apigateway';
import { CfnAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { CORS } from '../constants';
import { getCdkConstructId } from '../helpers';

export interface EndpointParams {
  skipAuth?: boolean;
  isMultipart?: boolean;
}

/**
 * Wrapper for adding Rest API related resources
 */
class ApiGateway {
  private readonly scope: Construct;
  private readonly api: IRestApi;
  private readonly authorizer?: TokenAuthorizer | CfnAuthorizer;
  private readonly requestModels?: Record<string, Model>;

  methods: Method[] = [];
  private readonly addedCorsPaths = new Set();

  constructor(scope: Construct, props: Record<any, any> & { stackName: string }) {
    this.scope = scope;

    this.api = RestApi.fromRestApiAttributes(
      scope,
      getCdkConstructId({ context: 'processing', resourceName: 'rest-api' }, scope),
      {
        restApiId: props.restApiId,
        rootResourceId: props.restApiRootResourceId,
      },
    );

    this.authorizer = props.authorizer;
    this.requestModels = props.requestModels;
  }

  /**
     * Get or create resource for specified path
     */
  private getResourceByPath(path: string): IResource {
    const resource = this.api.root.resourceForPath(path);
    if (!resource) {
      throw Error('Invalid resource');
    }

    // enable CORS for specified resource
    if (!this.addedCorsPaths.has(path)) {
      ApiGateway.addCorsOptions(resource);

      this.addedCorsPaths.add(path);
    }

    return resource;
  }

  private getMethodIntegration(handler: IFunction): LambdaIntegration {
    return new LambdaIntegration(handler, {
      proxy: true,
    });
  }

  private getMethodOptions(params?: EndpointParams): MethodOptions {
    const options = {} as Record<any, any>;

    if (params?.isMultipart && this.requestModels) {
      options.requestModels = {
        'multipart/form-data': this.requestModels.isMultipart,
      };
    }

    if (!this.authorizer || params?.skipAuth) {
      options.authorizationType = AuthorizationType.NONE;
    } else {
      options.authorizer = this.authorizer as IAuthorizer;
      options.authorizationType = AuthorizationType.CUSTOM;
    }

    return options;
  }

  addEndpoint(apiRoute: Record<any, any>, handler: IFunction, options?: EndpointParams): void {
    const resource = this.getResourceByPath(apiRoute.path);

    const method = resource.addMethod(
      apiRoute.method,
      this.getMethodIntegration(handler),
      this.getMethodOptions(options),
    );

    this.methods.push(method);
  }

  addMultipleEndpoints(
    apiRoutes: Record<any, any>[],
    handler: IFunction,
    options?: EndpointParams,
  ): void {
    // use one integration to reduce count of created resources
    const integration = this.getMethodIntegration(handler);

    const methods = apiRoutes.map((apiRoute) => {
      const resource = this.getResourceByPath(apiRoute.path);
      return resource.addMethod(apiRoute.method, integration, this.getMethodOptions(options));
    });

    this.methods = this.methods.concat(methods);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  static addCorsOptions(resource: IResource): void {
    resource.addMethod(
      'OPTIONS',
      new MockIntegration({
        passthroughBehavior: PassthroughBehavior.NEVER,
        contentHandling: ContentHandling.CONVERT_TO_TEXT,
        requestTemplates: {
          'application/json': '{"statusCode": 204}',
          'multipart/form-data': '{"statusCode": 204}',
        },
        integrationResponses: [
          {
            statusCode: '204',
            contentHandling: ContentHandling.CONVERT_TO_TEXT,
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': `'${CORS.HEADERS}'`,
              'method.response.header.Access-Control-Allow-Methods': `'${CORS.METHODS}'`,
              'method.response.header.Access-Control-Allow-Origin': `'${CORS.ORIGIN}'`,
            },
          },
        ],
      }),
      {
        methodResponses: [
          {
            statusCode: '204',
            responseModels: {
              'application/json': Model.EMPTY_MODEL,
              'multipart/form-data': Model.EMPTY_MODEL,
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Origin': true,
            },
          },
        ],
      },
    );
  }
}

export default ApiGateway;
