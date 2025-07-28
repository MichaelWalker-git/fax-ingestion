import {
  LambdaClient,
  InvokeCommand,
  InvocationType,
  LogType,
} from '@aws-sdk/client-lambda';

/**
 * Parameters for invoking a Lambda function
 */
export interface InvokeLambdaParams<T = any> {
  /** Name or ARN of the Lambda function to invoke */
  functionName: string;
  /** Payload to send to the Lambda function */
  payload: T;
  /** AWS region to use (defaults to process.env.AWS_REGION or 'eu-central-1') */
  region?: string;
  /** Invocation type */
  invocationType?: InvocationType;
  /** Whether to include execution logs in the response */
  includeLogs?: boolean;
  /** Client context for custom data (will be base64 encoded) */
  clientContext?: string;
  /** Function version or alias */
  qualifier?: string;
  headers?: Record<string, string | string[] | undefined | null>;
}

/**
 * Response from Lambda invocation
 */
export interface LambdaInvokeResponse<T = any> {
  /** HTTP status code from Lambda service */
  statusCode?: number;
  /** Function execution logs (if requested) */
  logs?: string;
  /** Error information if invocation failed */
  functionError?: string;
  /** Parsed response payload */
  payload?: T;
  /** Raw response payload as string */
  rawPayload?: string;
}

/**
 * Invokes an AWS Lambda function and returns the result
 *
 * @param params Parameters for the Lambda invocation
 * @returns The response from the Lambda function
 *
 * @example
 * // Synchronous invocation
 * const result = await invokeLambda({
 *   functionName: 'my-function',
 *   payload: { id: '123' },
 *   invocationType: InvocationType.RequestResponse
 * });
 *
 * @example
 * // Asynchronous invocation
 * await invokeLambda({
 *   functionName: 'notification-function',
 *   payload: { userId: 'user123', message: 'Hello' },
 *   invocationType: InvocationType.Event
 * });
 */
export async function invokeLambda<TPayload = any, TResponse = any>(
  params: InvokeLambdaParams<TPayload>,
): Promise<LambdaInvokeResponse<TResponse>> {
  const {
    functionName,
    payload,
    region = process.env.CDK_DEFAULT_REGION || 'us-east-1',
    invocationType = InvocationType.RequestResponse,
    includeLogs = false,
    clientContext,
    qualifier,
    headers,
  } = params;
  console.log('params:', params);
  const client = new LambdaClient({ region });

  // Prepare the final payload, including headers if provided
  const finalPayload = headers
    ? { ...payload, headers }
    : payload;

  console.log('finalPayload:', finalPayload);

  try {
    const command = new InvokeCommand({
      FunctionName: functionName,
      InvocationType: invocationType,
      Payload: Buffer.from(JSON.stringify(finalPayload)),
      LogType: includeLogs ? LogType.Tail : LogType.None,
      ClientContext: clientContext ?
        Buffer.from(clientContext).toString('base64') : undefined,
      Qualifier: qualifier,
    });

    const response = await client.send(command);

    const result: LambdaInvokeResponse<TResponse> = {
      statusCode: response.StatusCode,
      functionError: response.FunctionError,
    };

    // Parse logs if available
    if (response.LogResult) {
      result.logs = Buffer.from(response.LogResult, 'base64').toString('utf-8');
    }

    // Parse payload if available
    if (response.Payload) {
      const responseBuffer = Buffer.from(response.Payload);
      result.rawPayload = responseBuffer.toString();

      try {
        result.payload = JSON.parse(result.rawPayload) as TResponse;
      } catch (e) {
        console.warn('Failed to parse Lambda response as JSON', e);
      }
    }

    return result;
  } catch (error) {
    console.error('Error invoking Lambda function', error);
    throw error;
  }
}

/**
 * Invokes a Lambda function synchronously and waits for the result
 *
 * @param functionName Name or ARN of the Lambda function
 * @param payload Data to send to the Lambda function
 * @param options Additional options (region, qualifier, etc)
 * @returns The parsed response payload
 *
 * @example
 * const result = await invokeLambdaSync(
 *   'process-order',
 *   { orderId: '12345' },
 *   { region: 'us-west-2' }
 * );
 */
export async function invokeLambdaSync<TPayload = any, TResponse = any>(
  functionName: string,
  payload: TPayload,
  options: {
    region?: string;
    qualifier?: string;
    includeLogs?: boolean;
    headers?: Record<string, string | string[] | undefined | null>;
  } = {},
): Promise<TResponse> {
  const response = await invokeLambda<TPayload, TResponse>({
    functionName,
    payload,
    region: options.region,
    invocationType: InvocationType.RequestResponse,
    qualifier: options.qualifier,
    includeLogs: options.includeLogs,
    headers: options.headers,
  });

  if (response.functionError) {
    throw new Error(`Lambda function error: ${response.functionError}, payload: ${response.rawPayload}`);
  }

  if (!response.payload) {
    throw new Error('Lambda function returned empty response');
  }

  return response.payload;
}

/**
 * Invokes a Lambda function asynchronously (fire and forget)
 *
 * @param functionName Name or ARN of the Lambda function
 * @param payload Data to send to the Lambda function
 * @param options Additional options (region, qualifier, etc)
 *
 * @example
 * await invokeLambdaAsync(
 *   'send-email',
 *   { to: 'user@example.com', subject: 'Hello' }
 * );
 */
export async function invokeLambdaAsync<TPayload = any>(
  functionName: string,
  payload: TPayload,
  options: {
    region?: string;
    qualifier?: string;
    headers?: Record<string, string | string[] | undefined | null>;
  } = {},
): Promise<void> {
  await invokeLambda({
    functionName,
    payload,
    region: options.region,
    invocationType: InvocationType.Event,
    qualifier: options.qualifier,
    headers: options.headers,
  });
}
