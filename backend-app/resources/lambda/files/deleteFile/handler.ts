import { getLambdaResponse } from '../../../../shared/helpers';
import { ClientError, errorHandler } from '../../../../shared/services/Errors';
import { LambdaHandlerEvent } from '../../../../shared/types';
import { deleteFile } from '../helpers';

export const handler = async (event: LambdaHandlerEvent) => {
  try {
    console.log('Event:', event);

    const { fileId } = event.pathParameters;

    if (!fileId) {
      throw new ClientError('Required fileId is missing', 400);
    }

    await deleteFile(fileId);

    return getLambdaResponse({ message: 'Successfully removed' });
  } catch (e) {
    console.log(e);
    return errorHandler(e as Error);
  }
};
