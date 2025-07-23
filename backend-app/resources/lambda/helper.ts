import { removeUndefined } from '../../shared/helpers';

export const generateOutputPath = (
  outputKey: string,
): string => {
  return `${outputKey.replace(/\.[^/.]+$/, '')}.json`;
};

export interface ParsedResult {
  result: string;
  accuracy: number;
}

interface ParseError {
  error: string;
  originalText: string;
}

export interface FieldEntry {
  fieldName: string;
  value: string;
  accuracy?: string;
}

/**
 * Extracts `fields` array from a possibly malformed JSON LLM result.
 * @param extractedText - Raw LLM text response which includes embedded JSON.
 * @returns Array of unique fieldName/value objects.
 */
export const parseFieldsFromLLMResponse = (extractedText: string): { fields: FieldEntry[] } => {
  if (!extractedText || typeof extractedText !== 'string') {
    throw new Error('Invalid input: extractedText must be a non-empty string');
  }

  try {
    // Extract and sanitize inner JSON string from markdown block or nested string
    let content = extractedText.trim();
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = content.match(codeBlockRegex);
    if (match) {
      content = match[1].trim();
    }

    // Clean up common formatting issues
    content = content
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/,(\s*[}\]])/g, '$1') // trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"'); // single to double quotes

    // Parse outer object first
    const parsedOuter = JSON.parse(content);

    // Normalize if nested result field is stringified again
    let parsedResult = parsedOuter.result;
    if (typeof parsedResult === 'string') {
      parsedResult = JSON.parse(parsedResult);
    }

    const rawFields: FieldEntry[] = parsedResult.fields;

    if (!Array.isArray(rawFields)) {
      throw new Error('Missing or invalid "fields" array in parsed result');
    }

    // Deduplicate by fieldName, prefer first occurrence
    const dedupedMap = new Map<string, string>();
    for (const { fieldName, value } of rawFields) {
      if (!dedupedMap.has(fieldName)) {
        dedupedMap.set(fieldName, value);
      }
    }

    const fields: FieldEntry[] = Array.from(dedupedMap.entries()).map(([fieldName, value]) => ({
      fieldName,
      value,
    }));

    return { fields };
  } catch (error: any) {
    console.warn('Failed to parse fields:', error.message);
    return { fields: [] };
  }
};

/**
 * Parses extracted text from LLM response to JSON object
 * @param extractedText - The raw text response from LLM
 * @returns Parsed object with result and accuracy, or error object
 */
export const parseLLMResponse = (extractedText: string): ParsedResult | ParseError => {
  if (!extractedText || typeof extractedText !== 'string') {
    throw new Error('Invalid input: extractedText must be a non-empty string');
  }

  try {
    // Step 1: Clean the input text
    let cleanedText = extractedText.trim();

    // Step 2: Extract JSON from markdown code blocks if present
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const codeBlockMatch = cleanedText.match(codeBlockRegex);

    if (codeBlockMatch) {
      cleanedText = codeBlockMatch[1].trim();
    }

    // Step 3: Handle escaped newlines and quotes
    cleanedText = cleanedText
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");

    // Step 4: Parse the JSON
    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError: any) {
      // Try to fix common JSON issues
      let fixedText = cleanedText
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"'); // Replace single quotes with double quotes

      try {
        parsedData = JSON.parse(fixedText);
      } catch (secondParseError) {
        throw new Error(`Failed to parse JSON: ${parseError.message}`);
      }
    }

    // Step 5: Validate required fields
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Parsed data is not a valid object');
    }

    if (!('result' in parsedData)) {
      throw new Error('Missing required field: result');
    }

    if (!('accuracy' in parsedData)) {
      throw new Error('Missing required field: accuracy');
    }

    // Step 6: Normalize the data
    const result: ParsedResult = {
      result: parsedData.result,
      accuracy: parsedData.accuracy,
    };

    // Convert accuracy to string if it's a number
    result.accuracy = Number(result.accuracy);

    // Validate accuracy is a valid string
    if (typeof result.accuracy !== 'string') {
      throw new Error('Accuracy field must be a string or number');
    }

    return result;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`LLM text parsing failed: ${error.message}`);
    }
    throw new Error('LLM text parsing failed: Unknown error occurred');
  }
};

/**
 * Alternative parser with more flexible error handling
 * @param extractedText - The raw text response from LLM
 * @returns Always returns ParsedResult (with defaults on error)
 */
export const parseLLMResponseSafe = (extractedText: string): ParsedResult => {
  try {
    return <ParsedResult>parseLLMResponse(extractedText);
  } catch (error) {
    console.warn('Failed to parse LLM text, returning fallback:', error);

    // Try to extract any JSON-like content as fallback
    try {
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          result: parsed.result || extractedText,
          accuracy: parsed.accuracy?.toString() || 0,
        };
      }
    } catch {
      // Ignore fallback parsing errors
    }

    return {
      result: extractedText,
      accuracy: 0,
    };
  }
};

interface IPayload {
  Event?: Record<any, any>;
  Payload?: Record<any, any>;
  StateMachineContext?: Record<any, any>;
}

export function extractPayload(event: Record<any, any>): IPayload {
  const payload = {
    Event: { ...event },
    Payload: event?.Payload,
    StateMachineContext: event?.stateMachineContext?.Payload || event?.stateMachineContext,
  };

  return removeUndefined(payload);
}


export function extractBucketAndKey(s3Uri: string): { Bucket: string; Key: string } {
  const match = s3Uri.match(/^s3:\/\/([^/]+)\/(.+)$/);
  if (!match) throw new Error(`Invalid S3 URI: ${s3Uri}`);
  return {
    Bucket: match[1],
    Key: match[2],
  };
}
