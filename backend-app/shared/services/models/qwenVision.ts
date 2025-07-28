import { ModelResponse, VisionModelRequest } from '../../types/models';
import { checkAsyncInferenceStatus, invokeEndpointAsync, invokeEndpointSync } from '../SageMaker';
import { willExceedLimit } from '../TokenLimit';

const SAGE_MAKER_QWENEN_EDPOINT = process.env.SAGE_MAKER_QWENEN_EDPOINT || '';

const formatQwenPayload = (request: VisionModelRequest) => {
  const totalTokenEstimate = JSON.stringify(request).length / 4 + (request.max_tokens ?? 0);

  if (totalTokenEstimate > 10000) {
    throw new Error(`Payload too large, estimated token count: ${totalTokenEstimate}`);
  }

  return {
    messages: request.messages,
    temperature: request.temperature || 0.1,
    max_tokens: request.max_tokens || 1024,
    stream: false,
    top_p: 0.9,
    do_sample: false,
    repetition_penalty: 1.1,
  };
};

type Data = { url: string; page: number };

export const processImageSynch = async ({
  data,
  prompt,
  temperature,
  max_tokens,
}: {
  data: Data[];
  prompt: string;
  temperature?: number;
  max_tokens?: number;
}) => {
  const batchSize = 1;

  const results = [];

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)[0];
    const result = await processImage({ data: batch, prompt, temperature, max_tokens });

    results.push(result);
  }
  return results;
};

export const processImage = async ({
  data,
  prompt,
  temperature,
  max_tokens,
}: {
  data: Data;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
}): Promise<ModelResponse> => {
  const imagesContent: { type: 'image_url'; image_url: { url: string } } = {
    type: 'image_url',
    image_url: {
      url: data.url,
    },
  };
  console.log('imagesContent', imagesContent);

  const request: VisionModelRequest = {
    messages: [
      {
        role: 'user',
        content: [
          imagesContent,
          { type: 'text', text: prompt },
        ],
      },
    ],
    temperature,
    max_tokens,
  };

  console.log('request', JSON.stringify(request, null, 2));

  const payload = formatQwenPayload(request);
  const response = await invokeEndpointSync(SAGE_MAKER_QWENEN_EDPOINT, payload);

  return {
    ...data,
    content: response.choices?.[0]?.message?.content || response.content || '',
    usage: response.usage,
  };
};

export interface AsyncModelResponse {
  inferenceId: string;
  status: 'initiated' | 'completed' | 'failed' | 'in_progress';
  outputLocation?: string;
  failureLocation?: string;
  inputLocation?: string;
  result?: ModelResponse;
  error?: string;
}

export const processImageAsync = async ({
  data,
  prompt,
  temperature,
  max_tokens,
  customInferenceId,
}: {
  data: Data;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
  customInferenceId?: string;
}): Promise<AsyncModelResponse> => {
  const imagesContent: { type: 'image_url'; image_url: { url: string } } = {
    type: 'image_url',
    image_url: {
      url: data.url,
    },
  };
  console.log('imagesContent', imagesContent);

  const request: VisionModelRequest = {
    messages: [
      {
        role: 'user',
        content: [
          imagesContent,
          { type: 'text', text: prompt },
        ],
      },
    ],
    temperature,
    max_tokens,
  };

  console.log('async request', JSON.stringify(request, null, 2));

  const payload = formatQwenPayload(request);
  const asyncResponse = await invokeEndpointAsync(SAGE_MAKER_QWENEN_EDPOINT, payload, customInferenceId);

  return {
    inferenceId: asyncResponse.inferenceId,
    status: 'initiated',
    outputLocation: asyncResponse.outputLocation,
    failureLocation: asyncResponse.failureLocation,
    inputLocation: asyncResponse.inputLocation,
  };
};


export const processQuestionSynch = async ({
  prompt,
  context,
  temperature,
  max_tokens,
}: {
  prompt: string;
  context: string;
  temperature?: number;
  max_tokens?: number;
}): Promise<ModelResponse> => {
  const willExceed = willExceedLimit(context, {
    maxTokens: 10000,
    reserveTokensForPrompt: prompt.length,
  });

  if (willExceed) {
    throw new Error('Context exceeds token limit');
  }

  const content = `Context: ${context}\n\nQuestion: ${prompt}`;

  const request: VisionModelRequest = {
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: content },
        ],
      },
    ],
    temperature,
    max_tokens,
  };

  console.log('request', JSON.stringify(request, null, 2));

  const payload = formatQwenPayload(request);
  const response = await invokeEndpointSync(SAGE_MAKER_QWENEN_EDPOINT, payload);

  return {
    content: response.choices?.[0]?.message?.content || response.content || '',
    usage: response.usage,
  };
};

export const processQuestionAsync = async ({
  prompt,
  context,
  temperature,
  max_tokens,
  customInferenceId,
}: {
  prompt: string;
  context: string;
  temperature?: number;
  max_tokens?: number;
  customInferenceId?: string;
}): Promise<AsyncModelResponse> => {
  const willExceed = willExceedLimit(context, {
    maxTokens: 10000,
    reserveTokensForPrompt: prompt.length,
  });

  if (willExceed) {
    throw new Error('Context exceeds token limit');
  }

  const content = `Context: ${context}\n\nQuestion: ${prompt}`;

  const request: VisionModelRequest = {
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: content },
        ],
      },
    ],
    temperature,
    max_tokens,
  };

  console.log('async request', JSON.stringify(request, null, 2));

  const payload = formatQwenPayload(request);
  const asyncResponse = await invokeEndpointAsync(SAGE_MAKER_QWENEN_EDPOINT, payload, customInferenceId);

  return {
    inferenceId: asyncResponse.inferenceId,
    status: 'initiated',
    outputLocation: asyncResponse.outputLocation,
    failureLocation: asyncResponse.failureLocation,
    inputLocation: asyncResponse.inputLocation,
  };
};

// Utility functions for checking async inference status and getting results
export const getAsyncImageResult = async (asyncResponse: AsyncModelResponse, data: Data): Promise<AsyncModelResponse> => {
  if (!asyncResponse.outputLocation || !asyncResponse.failureLocation) {
    throw new Error('Missing output or failure location in async response');
  }

  const statusCheck = await checkAsyncInferenceStatus(
    asyncResponse.outputLocation,
    asyncResponse.failureLocation,
  );

  if (statusCheck.status === 'completed' && statusCheck.result) {
    return {
      ...asyncResponse,
      status: 'completed',
      result: {
        ...data,
        content: statusCheck.result.choices?.[0]?.message?.content || statusCheck.result.content || '',
        usage: statusCheck.result.usage,
      },
    };
  } else if (statusCheck.status === 'failed') {
    return {
      ...asyncResponse,
      status: 'failed',
      error: statusCheck.error,
    };
  } else {
    return {
      ...asyncResponse,
      status: 'in_progress',
    };
  }
};

export const getAsyncQuestionResult = async (asyncResponse: AsyncModelResponse): Promise<AsyncModelResponse> => {
  if (!asyncResponse.outputLocation || !asyncResponse.failureLocation) {
    throw new Error('Missing output or failure location in async response');
  }

  const statusCheck = await checkAsyncInferenceStatus(
    asyncResponse.outputLocation,
    asyncResponse.failureLocation,
  );

  if (statusCheck.status === 'completed' && statusCheck.result) {
    return {
      ...asyncResponse,
      status: 'completed',
      result: {
        content: statusCheck.result.choices?.[0]?.message?.content || statusCheck.result.content || '',
        usage: statusCheck.result.usage,
      },
    };
  } else if (statusCheck.status === 'failed') {
    return {
      ...asyncResponse,
      status: 'failed',
      error: statusCheck.error,
    };
  } else {
    return {
      ...asyncResponse,
      status: 'in_progress',
    };
  }
};

// Convenience function to poll for results with timeout
export const pollAsyncResult = async (
  asyncResponse: AsyncModelResponse,
  data?: Data,
  options: {
    maxRetries?: number;
    retryInterval?: number; // milliseconds
  } = {},
): Promise<AsyncModelResponse> => {
  const { maxRetries = 50, retryInterval = 10000 } = options; // Default: 5 minutes total (30 * 10s)

  let retries = 0;

  while (retries < maxRetries) {
    const result = data
      ? await getAsyncImageResult(asyncResponse, data)
      : await getAsyncQuestionResult(asyncResponse);

    if (result.status === 'completed' || result.status === 'failed') {
      return result;
    }

    retries++;
    if (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }

  return {
    ...asyncResponse,
    status: 'in_progress',
    error: `Polling timeout after ${maxRetries} retries`,
  };
};
