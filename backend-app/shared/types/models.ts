export interface BaseModelRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: Array<{
      type: 'text' | 'image' | 'image_url';
      text?: string;
      image_url?: { url: string };
    }>;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface VisionModelRequest extends BaseModelRequest {
  images?: string[]; // Base64 encoded images or S3 URLs
}

export interface ModelResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
