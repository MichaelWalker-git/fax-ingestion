export default interface ProcessingResult {
  accuracy?: string;
  result: { fields: IProcessingResultField[] };
}

export interface IProcessingResultField {
  fieldName: string;
  value: string;
  fieldType: string;
  verified?: boolean;
  isValid?: string;
  validationError?: string;
  isApproved?: boolean;
}
