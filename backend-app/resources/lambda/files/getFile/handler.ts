import { FILE_STATUSES } from '../../../../shared/constants';
import { getLambdaResponse } from '../../../../shared/helpers';
import { getFile } from '../../../../shared/services/entities/Files';
import { ClientError, errorHandler } from '../../../../shared/services/Errors';
import { getFileAsPresignedUrl } from '../../../../shared/services/S3';
import { LambdaHandlerEvent } from '../../../../shared/types';

const INPUT_BUCKET = process.env.INPUT_BUCKET || '';
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET || '';

export const handler = async (event: LambdaHandlerEvent) => {
  try {
    console.log('Event:', event);

    const { fileId } = event.pathParameters;

    if (!fileId) {
      throw new ClientError('Required fileId is missing', 400);
    }

    const item = await getFile({
      sortKey: fileId,
    });

    if (!item) {
      throw new ClientError(`File with ID ${fileId} not found`, 404);
    }

    const { status } = item;

    if (status === FILE_STATUSES.IN_PROGRESS) {
      return getLambdaResponse({ item });
    }

    // Generate presigned URL for download
    const fileKey = item.s3Path?.replace(/^s3:\/\/[^/]+\//, '') || '';
    const url = await getFileAsPresignedUrl(INPUT_BUCKET, fileKey);

    if (item.resultS3Path) {
      const resultKey = item.resultS3Path?.replace(/^s3:\/\/[^/]+\//, '');
      const resultUrl = await getFileAsPresignedUrl(OUTPUT_BUCKET, resultKey);

      return getLambdaResponse({ item: { ...item, filePresignedUrl: url, resultPresignedUrl: resultUrl } });
    }

    return getLambdaResponse({ item: { ...item, filePresignedUrl: url } });
  } catch (e) {
    console.log(e);
    return errorHandler(e as Error);
  }
};
