import { pollAsyncResult, processImageAsync } from '../../../../shared/services/models/qwenVision';

export const runLLMExtraction = async (imageData: { url: string; page: number }, prompt: string) => {
  const asyncResponse = await processImageAsync({ data: imageData, prompt });
  console.log('Async Response:', JSON.stringify(asyncResponse, null, 2));

  const finalResponse = await pollAsyncResult(asyncResponse, imageData);
  console.log('Final Async Result:', JSON.stringify(finalResponse, null, 2));

  if (finalResponse.status !== 'completed' || !finalResponse.result) {
    throw new Error(`SageMaker async inference failed or timed out: ${finalResponse.error || 'unknown error'}`);
  }

  return finalResponse;
};
