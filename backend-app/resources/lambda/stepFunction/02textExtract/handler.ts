import { runLLMExtraction } from './helpers';
import { ALL_EXTRACTION_FIELDS } from '../../../../shared/constants/fields';
import { errorHandler } from '../../../../shared/services/Errors';
import { generateFaxExtractionPrompt } from '../../../../shared/services/PromptGenerator';
import { getFileAsJson, getFileAsPresignedUrl, uploadFile } from '../../../../shared/services/S3';
import { LambdaHandlerEvent } from '../../../../shared/types';
import { extractPayload, parseFieldsFromLLMResponse, parseLLMResponseSafe } from '../../helper';

const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET || '';
const ASYNC_S3_BUCKET = process.env.ASYNC_S3_BUCKET || '';

export const handler = async (event: LambdaHandlerEvent) => {
  try {
    console.log('Event:', event);

    const payload = extractPayload(event).Event;
    if (!payload) throw new Error('Payload is required');

    const { key, page, filename, fileId } = payload;
    const imagePresignedUrl = await getFileAsPresignedUrl(ASYNC_S3_BUCKET, key);
    const imageData = { url: imagePresignedUrl, page };

    // Get extracted data
    const resultKey = `text/${filename}.json`;
    const extractedData = await getFileAsJson(OUTPUT_BUCKET, resultKey) as Record<any, any>;

    const fieldsSchema = extractedData.fields || ALL_EXTRACTION_FIELDS;
    const fieldsWithNoValueSchema = fieldsSchema.filter((field: Record<any, any>) => !field.value);

    console.log('fieldsWithNoValueSchema', JSON.stringify(fieldsWithNoValueSchema.fields, null, 2));
    console.log('fieldsSchema', JSON.stringify(fieldsSchema, null, 2));

    // Kick off both async inference processes in parallel
    const [fieldExtractionTask] = await Promise.all([
      runLLMExtraction(imageData, generateFaxExtractionPrompt()),
    ]);

    if (!fieldExtractionTask.result) {
      throw new Error('Async inference tasks are empty');
    }

    const extractedFieldsResultParsed = await parseLLMResponseSafe(fieldExtractionTask.result.content);
    console.log('extractedFieldsResultParsed', JSON.stringify(extractedFieldsResultParsed, null, 2));

    if (!extractedFieldsResultParsed) {
      throw new Error('Parsed extraction results are empty');
    }

    const { result: fieldsData } = extractedFieldsResultParsed;
    const { fields } = typeof fieldsData === 'string'
      ? parseFieldsFromLLMResponse(fieldsData)
      : fieldsData;

    const fieldsResults = fieldsSchema.map((field: Record<any, any>) => {
      const matchingField = fields.find((f) => f.fieldName === field.fieldName);

      return { ...field, value: matchingField?.value || field.value };
    });
    console.log('fieldsResults', JSON.stringify(fieldsResults, null, 2));

    const fileResults = {
      fields: fieldsResults,
      fieldsAccuracy: extractedFieldsResultParsed.accuracy,
    };

    console.log('fileResults', JSON.stringify(fileResults, null, 2));

    await uploadFile(OUTPUT_BUCKET, resultKey, fileResults, 'application/json');

    return { filename, fileId, page, resultKey };

  } catch (e: Error | any) {
    console.error(e);
    return errorHandler(e);
  }
};
