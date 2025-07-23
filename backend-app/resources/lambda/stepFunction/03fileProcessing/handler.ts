import {
  FILE_STATUSES,
} from '../../../../shared/constants';
import {
  generateS3Path,
  getLambdaResponse,
} from '../../../../shared/helpers';
import { updateFile } from '../../../../shared/services/entities/Files';
import { errorHandler } from '../../../../shared/services/Errors';
import {
  getFileAsJson,
  uploadFile,
} from '../../../../shared/services/S3';
import { LambdaHandlerEvent } from '../../../../shared/types';
import { validateFields } from '../../../../shared/validation/fields';
import { extractPayload, generateOutputPath } from '../../helper';

const OUTPUT_BUCKET = (() => {
  const b = process.env.OUTPUT_BUCKET;
  if (!b) throw new Error('Missing OUTPUT_BUCKET env var');
  return b;
})();


export const handler = async (
  event: LambdaHandlerEvent,
): Promise<Record<string, any>> => {
  try {
    console.log('Incoming event:', JSON.stringify(event, null, 2));

    // Extract & validate payload
    const { Payload, StateMachineContext } = extractPayload(event);
    const payload = Payload ?? StateMachineContext;
    if (!payload) throw new Error('Missing state machine payload');
    const { pdfKey, fileId, filename } = payload;

    // Load previous OCR results
    const resultKey = `text/${filename}.json`;
    const fileResults = (await getFileAsJson(
      OUTPUT_BUCKET,
      resultKey,
    )) as { fields: any[]; fieldsAccuracy: number };
    if (!fileResults?.fields) throw new Error('No OCR fields found');

    const validatedFields = validateFields(fileResults.fields);

    // Assemble final payload for S3
    const validatedData = {
      result: { fields: validatedFields },
      accuracy: fileResults.fieldsAccuracy,
    };

    // Write back to S3
    const outputKey = generateOutputPath(pdfKey);
    const resultS3Path = generateS3Path(OUTPUT_BUCKET, outputKey);
    await uploadFile(
      OUTPUT_BUCKET,
      outputKey,
      JSON.stringify(validatedData),
      'application/json',
    );

    // Mark file as processed
    await updateFile({
      sortKey: fileId,
      status: FILE_STATUSES.PROCESSED,
      resultS3Path,
    });

    return getLambdaResponse(
      { message: 'Extraction completed' },
    );
  } catch (error) {
    console.error('Handler error:', error);
    return errorHandler(error as Error);
  }
};
