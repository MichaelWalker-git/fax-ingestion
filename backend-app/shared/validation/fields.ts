import Joi from 'joi';
import { FIELD_NAMES } from '../constants/fields';

interface Field {
  fieldName: string;
  value: string;
  isValid?: string;
  validationError?: string;
}

const fieldSchemas: Record<string, Joi.StringSchema> = {
  // Patient Demographics
  [FIELD_NAMES.FULL_NAME]: Joi.string().required(),
  [FIELD_NAMES.DATE_OF_BIRTH]: Joi.string().pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$|^\d{4}-\d{2}-\d{2}$/, { name: 'MM/DD/YYYY or YYYY-MM-DD' }),
  [FIELD_NAMES.MEDICAL_RECORD_NUMBER]: Joi.string().alphanum().required(),
  [FIELD_NAMES.SOCIAL_SECURITY_NUMBER]: Joi.string().pattern(/^\d{3}-\d{2}-\d{4}$|^\d{9}$/, { name: 'SSN format' }),
  [FIELD_NAMES.ADDRESS]: Joi.string().required(),
  [FIELD_NAMES.PRIMARY_PHONE]: Joi.string().pattern(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, { name: 'phone number format' }),
  [FIELD_NAMES.EMERGENCY_PHONE]: Joi.string().pattern(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, { name: 'phone number format' }),
  [FIELD_NAMES.GENDER]: Joi.string().valid('M', 'F', 'Other', 'Male', 'Female'),
  [FIELD_NAMES.EMERGENCY_CONTACT_NAME]: Joi.string(),
  [FIELD_NAMES.EMERGENCY_CONTACT_RELATIONSHIP]: Joi.string(),

  // Provider Information
  [FIELD_NAMES.REFERRING_PHYSICIAN]: Joi.string(),
  [FIELD_NAMES.NPI_NUMBER]: Joi.string().pattern(/^\d{10}$/, { name: '10-digit NPI' }),
  [FIELD_NAMES.PRACTICE_NAME]: Joi.string(),
  [FIELD_NAMES.PROVIDER_PHONE]: Joi.string().pattern(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/),
  [FIELD_NAMES.PROVIDER_FAX]: Joi.string().pattern(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/),
  [FIELD_NAMES.PROVIDER_ADDRESS]: Joi.string(),
  [FIELD_NAMES.ORDERING_PHYSICIAN]: Joi.string(),
  [FIELD_NAMES.PRIMARY_CARE_PHYSICIAN]: Joi.string(),

  // Insurance
  [FIELD_NAMES.PRIMARY_INSURANCE]: Joi.string(),
  [FIELD_NAMES.POLICY_MEMBER_ID]: Joi.string().alphanum(),
  [FIELD_NAMES.GROUP_NUMBER]: Joi.string().alphanum(),
  [FIELD_NAMES.AUTHORIZATION_NUMBER]: Joi.string().alphanum(),
  [FIELD_NAMES.COVERAGE_START]: Joi.string().pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, { name: 'MM/DD/YYYY' }),
  [FIELD_NAMES.COVERAGE_END]: Joi.string().pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, { name: 'MM/DD/YYYY' }),
  [FIELD_NAMES.SECONDARY_INSURANCE]: Joi.string(),
  [FIELD_NAMES.MEDICARE_NUMBER]: Joi.string(),
  [FIELD_NAMES.MEDICAID_NUMBER]: Joi.string(),

  // Clinical Data
  [FIELD_NAMES.PRIMARY_DIAGNOSIS]: Joi.string(),
  [FIELD_NAMES.SECONDARY_DIAGNOSES]: Joi.string(),
  [FIELD_NAMES.PROCEDURES]: Joi.string(),
  [FIELD_NAMES.CURRENT_MEDICATIONS]: Joi.string(),
  [FIELD_NAMES.BLOOD_PRESSURE]: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/, { name: 'blood pressure format (e.g., 120/80)' }),
  [FIELD_NAMES.HEART_RATE]: Joi.string().pattern(/^\d{2,3}$/, { name: 'bpm' }),
  [FIELD_NAMES.TEMPERATURE]: Joi.string().pattern(/^\d{2,3}\.\d{1}$/, { name: 'temperature format (e.g., 98.6)' }),
  [FIELD_NAMES.WEIGHT]: Joi.string(),
  [FIELD_NAMES.OXYGEN_SATURATION]: Joi.string().pattern(/^\d{2,3}%$/, { name: 'O2 saturation (e.g., 98%)' }),
  [FIELD_NAMES.FUNCTIONAL_STATUS]: Joi.string(),
  [FIELD_NAMES.ALLERGIES]: Joi.string(),
  [FIELD_NAMES.MEDICAL_HISTORY]: Joi.string(),

  // Critical Dates
  [FIELD_NAMES.ADMISSION_DATE]: Joi.string().pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, { name: 'MM/DD/YYYY' }),
  [FIELD_NAMES.DISCHARGE_DATE]: Joi.string().pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, { name: 'MM/DD/YYYY' }),
  [FIELD_NAMES.DATE_OF_SERVICE]: Joi.string().pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, { name: 'MM/DD/YYYY' }),
  [FIELD_NAMES.ORDER_DATE]: Joi.string().pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, { name: 'MM/DD/YYYY' }),
  [FIELD_NAMES.AUTHORIZATION_START]: Joi.string().pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, { name: 'MM/DD/YYYY' }),
  [FIELD_NAMES.AUTHORIZATION_END]: Joi.string().pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, { name: 'MM/DD/YYYY' }),
  [FIELD_NAMES.NEXT_APPOINTMENT]: Joi.string(), // Could be date+time but leaving flexible
  [FIELD_NAMES.FACE_TO_FACE_DATE]: Joi.string().pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, { name: 'MM/DD/YYYY' }),
};

export const validateFields = (fields: Field[]): Field[] => {
  return fields.map((field) => {
    const schema = fieldSchemas[field.fieldName] || Joi.string().allow('');
    const result = schema.validate(field.value, { abortEarly: true });

    let isValid = 'true';
    let validationError = '';

    if (result.error) {
      const detail = result.error.details[0];
      const patternName = detail.context?.name || 'the required format';
      validationError = `${field.fieldName} with value "${field.value}" fails to match the ${patternName}`;
      isValid = 'false';
    }

    return {
      ...field,
      isValid,
      validationError,
    };
  });
};
