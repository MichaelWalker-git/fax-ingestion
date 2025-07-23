import { getLambdaResponse } from '../../../../shared/helpers';
import { getFiles } from '../../../../shared/services/entities/Files';
import { errorHandler } from '../../../../shared/services/Errors';
import { LambdaHandlerEvent } from '../../../../shared/types';

export const handler = async (event: LambdaHandlerEvent) => {
  try {
    console.log('Event:', event);

    const items = await getFiles({});
    console.log('items:', items);

    return getLambdaResponse({ items });
  } catch (e) {
    console.log(e);
    return errorHandler(e as Error);
  }
};
