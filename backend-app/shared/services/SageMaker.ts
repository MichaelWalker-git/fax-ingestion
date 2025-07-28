import { SageMakerRuntime } from '@aws-sdk/client-sagemaker-runtime';
import { v4 as uuid } from 'uuid';
import { getFileAsJson, getFileAsString, uploadFile } from './S3';

const REGION = process.env.CDK_DEFAULT_REGION || 'eu-central-1';
const ASYNC_S3_BUCKET = process.env.ASYNC_S3_BUCKET;

const client = new SageMakerRuntime({ region: REGION });

export const invokeEndpointSync = async (endpointName: string, payload: any): Promise<any> => {
  try {
    const params = {
      EndpointName: endpointName,
      ContentType: 'application/json',
      Accept: 'application/json',
      Body: JSON.stringify(payload),
    };

    const response = await client.invokeEndpoint(params);

    if (!response.Body) {
      throw new Error('Empty response from SageMaker endpoint');
    }

    const responseBody = JSON.parse(new TextDecoder().decode(response.Body));
    return responseBody;
  } catch (error) {
    console.error('SageMaker endpoint invocation failed:', error);
    throw new Error(`SageMaker endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export interface AsyncInferenceResponse {
  inferenceId: string;
  outputLocation: string;
  failureLocation: string;
  inputLocation: string;
}

export const invokeEndpointAsync = async (
  endpointName: string,
  payload: any,
  customInferenceId?: string,
): Promise<AsyncInferenceResponse> => {
  try {
    if (!ASYNC_S3_BUCKET) {
      throw new Error('ASYNC_S3_BUCKET environment variable is required for async inference');
    }

    const inferenceId = customInferenceId || uuid();
    const inputKey = `input/${inferenceId}/input.json`;
    const outputLocation = `s3://${ASYNC_S3_BUCKET}/output/${inferenceId}/`;
    const failureLocation = `s3://${ASYNC_S3_BUCKET}/error/${inferenceId}/`;

    // Upload input payload to S3
    await uploadFile(
      ASYNC_S3_BUCKET,
      inputKey,
      JSON.stringify(payload),
      'application/json',
    );

    const inputLocation = `s3://${ASYNC_S3_BUCKET}/${inputKey}`;

    // Invoke async endpoint
    const params = {
      EndpointName: endpointName,
      InputLocation: inputLocation,
      OutputLocation: outputLocation,
      ContentType: 'application/json',
      Accept: 'application/json',
      InvocationTimeoutSeconds: 3600, // 1 hour timeout
      RequestTTLSeconds: 21600, // 6 hours TTL
    };

    const response = await client.invokeEndpointAsync(params);
    console.log('response:', JSON.stringify(response, null, 2));

    if (!response.OutputLocation) {
      throw new Error('No output location returned from async endpoint');
    }

    return {
      inferenceId,
      outputLocation: response.OutputLocation,
      failureLocation: response.FailureLocation || failureLocation,
      inputLocation,
    };
  } catch (error) {
    console.error('SageMaker async endpoint invocation failed:', error);
    throw new Error(`SageMaker async endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getAsyncInferenceResult = async (outputLocation: string): Promise<any> => {
  try {
    // Extract bucket and key from S3 URL
    const url = new URL(outputLocation);
    const bucket = url.hostname.split('.')[0];
    const key = url.pathname.substring(1); // Remove leading slash

    const response = await getFileAsJson(bucket, key);

    if (!response) {
      throw new Error('Empty response from S3');
    }

    return response;
  } catch (error) {
    console.error('Failed to get async inference result');
    throw new Error(`Failed to get async result: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const checkAsyncInferenceStatus = async (outputLocation: string, failureLocation: string): Promise<{
  status: 'completed' | 'failed' | 'in_progress';
  result?: any;
  error?: string;
}> => {
  try {
    // Check if output exists (success case)
    try {
      const result = await getAsyncInferenceResult(outputLocation);
      return { status: 'completed', result };
    } catch (outputError: any) {
      // Output doesn't exist yet, check if failure exists
      try {
        console.log('file not found, processing...');

        const url = new URL(failureLocation);
        const bucket = url.hostname.split('.')[0];
        const key = url.pathname.substring(1);

        const response = await getFileAsString(bucket, key);

        if (response) {
          const errorBody = response;
          return { status: 'failed', error: errorBody };
        }
      } catch (failureError) {
        // Neither output nor failure exists, still in progress
        console.log('still in progress');
        return { status: 'in_progress' };
      }
    }

    return { status: 'in_progress' };
  } catch (error) {
    console.error('Failed to check async inference status');
    throw new Error(`Failed to check status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
