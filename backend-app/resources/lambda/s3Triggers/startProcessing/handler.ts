import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import { FILE_STATUSES } from '../../../../shared/constants';
import { extractFilename, generateS3Path, getLambdaResponse } from '../../../../shared/helpers';
import { addFile, updateFile } from '../../../../shared/services/entities/Files';
import { errorHandler } from '../../../../shared/services/Errors';
import { uploadFile } from '../../../../shared/services/S3';

const stepFunctions = new SFNClient();
const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN || '';
const ASYNC_S3_BUCKET = process.env.ASYNC_S3_BUCKET || '';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET || '';

export const handler: (event: SQSEvent) => Promise<{
  headers: { 'Access-Control-Allow-Origin': string; 'Content-Type': string };
  body: string;
  statusCode: number;
} | APIGatewayProxyResult> = async (event: SQSEvent) => {
  try {
    console.log('Event', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
      const s3Event = JSON.parse(record.body);

      await Promise.all(s3Event.Records.map(async (s3Record: Record<string, any>) => {
        console.log('s3Record:', s3Record);

        const bucketName = s3Record.s3.bucket.name;
        const key = decodeURIComponent(s3Record.s3.object.key.replace(/\+/g, ' '));

        // Check if the file is a PDF
        if (!key.toLowerCase().endsWith('.pdf')) {
          console.log(`Skipping non-PDF file: ${key}`);
          return;
        }

        // Add file
        const fileId = uuid();
        const s3Path = generateS3Path(bucketName, key);
        const filename = extractFilename(key);

        await addFile({
          sortKey: fileId,
          status: FILE_STATUSES.UPLOADED,
          s3Path,
          filename,
        });

        // Add file results
        const resultKey = `text/${filename}.json`;
        await uploadFile(OUTPUT_BUCKET, resultKey, {}, 'application/json');

        // Update file
        await updateFile({
          sortKey: fileId,
          status: FILE_STATUSES.IN_PROGRESS,
        });

        // Start processing
        const command = new StartExecutionCommand({
          stateMachineArn: STATE_MACHINE_ARN,
          input: JSON.stringify({
            fileId,
            filename,
            s3Path,
            bucket: bucketName,
            resultBucket: ASYNC_S3_BUCKET,
            pdfKey: key,
            outputPrefix: 'images',
            format: 'jpeg',
          }),
        });

        await stepFunctions.send(command);

        // Update file
        await updateFile({
          sortKey: fileId,
          status: FILE_STATUSES.IN_PROGRESS,
        });
      }));
    }

    return getLambdaResponse({ message: 'Processing started' });
  } catch (e: Error | any) {
    console.log(e);
    return errorHandler(e as Error);
  }
};
