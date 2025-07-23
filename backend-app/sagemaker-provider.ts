import type {
  ApiProvider,
  ProviderOptions,
} from 'promptfoo';
import { parseLLMResponseSafe } from './resources/lambda/helper';
import { patientFields } from './shared/constants';
import { pollAsyncResult, processImageAsync } from './shared/services/models/qwenVision';
import { promptfooTestPrompt } from './shared/services/PromptGenerator';
import { getFileAsPresignedUrl } from './shared/services/S3';

const ASYNC_S3_BUCKET = process.env.ASYNC_S3_BUCKET || '';

export const runLLMExtraction = async (imageData: { url: string; page: number }, prompt: string, max_tokens?: number, temperature?: number) => {
  const asyncResponse = await processImageAsync({ data: imageData, prompt, temperature, max_tokens });
  console.log('Async Response:', JSON.stringify(asyncResponse, null, 2));

  const finalResponse = await pollAsyncResult(asyncResponse, imageData);
  console.log('Final Async Result:', JSON.stringify(finalResponse, null, 2));

  if (finalResponse.status !== 'completed' || !finalResponse.result) {
    throw new Error(`SageMaker async inference failed or timed out: ${finalResponse.error || 'unknown error'}`);
  }

  return finalResponse;
};

export default class Provider implements ApiProvider {
  protected providerId: string;
  public config: Record<string, any>;

  constructor(options: ProviderOptions) {
    this.providerId = options.id || 'typed-provider';
    this.config = options.config || {};
  }

  id(): string {
    return this.providerId;
  }

  async callApi(prompt: string, context?: Record<string, any>): Promise<any> {
    try {
      console.log('prompt', prompt);
      console.log('key', context?.vars.key);

      const config = context?.originalProvider.config;
      const temperature = config.temperature;
      const max_tokens = config.max_tokens;

      console.log('temperature', temperature);
      console.log('max_tokens', max_tokens);

      const imagePresignedUrl = await getFileAsPresignedUrl(ASYNC_S3_BUCKET, context?.vars.key);
      console.log('imagePresignedUrl', imagePresignedUrl);

      const imageData = { url: imagePresignedUrl, page: 1 };
      console.log('imageData', imageData);

      const [fieldExtractionTask] = await Promise.all([
        runLLMExtraction(imageData, promptfooTestPrompt(prompt, patientFields), max_tokens, temperature),
      ]);

      if (!fieldExtractionTask.result) {
        throw new Error('Async inference tasks are empty');
      }

      const extractedFieldsResultParsed = await parseLLMResponseSafe(fieldExtractionTask.result.content);
      console.log('extractedFieldsResultParsed', JSON.stringify(extractedFieldsResultParsed, null, 2));

      return {
        output: JSON.stringify(extractedFieldsResultParsed, null, 2),
        tokenUsage: {
          total: fieldExtractionTask.result.usage?.total_tokens || 0,
          prompt: fieldExtractionTask.result.usage?.prompt_tokens || 0,
          completion: fieldExtractionTask.result.usage?.completion_tokens || 0,
        },
      };
    } catch (error: any) {
      return {
        error: `SageMaker API Error: ${error.message}`,
        output: null,
      };
    }
  }
}

