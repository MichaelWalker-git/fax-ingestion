import Joi from 'joi';
import { ClientError } from '../services/Errors';

export const validationHelper = <T>(schema: Joi.ObjectSchema, object: any): T => {
  const { error, value } = schema.validate(object);
  if (error) {
    console.log(error);
    console.log('error.details', error.details);
    throw new ClientError(`There is a validation issue: ${error.details[0]?.message}`, 400);
  }
  return value as T;
};
