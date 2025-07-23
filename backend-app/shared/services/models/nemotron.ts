import { BaseModelRequest, ModelResponse, VisionModelRequest } from '../../types/models';
import { invokeEndpointSync } from '../SageMaker';

const SAGE_MAKER_NEMOTRON_EDPOINT = process.env.SAGE_MAKER_NEMOTRON_EDPOINT || '';

const formatNemotronPayload = (request: BaseModelRequest) => ({
  messages: request.messages,
  temperature: request.temperature,
  max_tokens: request.max_tokens,
  top_p: 0.9,
  stream: false,
});

const processQuestion = async ({
  prompt,
  context,
  temperature = 0.1,
  max_tokens = 2048,
}: {
  prompt: string;
  context?: string;
  temperature?: number;
  max_tokens?: number;
}): Promise<ModelResponse> => {
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

  const payload = formatNemotronPayload(request);
  const response = await invokeEndpointSync(SAGE_MAKER_NEMOTRON_EDPOINT, payload);

  return {
    content: response.choices?.[0]?.message?.content || response.content || '',
    usage: response.usage,
  };
};
