import {
  ALL_EXTRACTION_FIELDS,
  DOCUMENT_TYPE_DESCRIPTIONS,
  DOCUMENT_TYPES,
} from '../constants/fields';

export const promptProcessingGenerator = ({
  processingRequirements,
  responseSchema,
}: {
  processingRequirements: string;
  responseSchema: Record<any, any>;
}) => {
  return `
    TASK DESCRIPTION:
    ${processingRequirements}
  
    ACCURACY AND COMPLETENESS EVALUATION:
      - Add to response accuracy value that evaluate its accuracy, relevance, and completeness.
      - Accuracy based on the value relevance. If value has Patient name label = 100, if value has Member name label = 70, if value has no label = 20, etc.
      - Identify any potential biases, gaps, or areas for improvement, and suggest refinements if necessary results as value is between 0 to 100. 
      - Don't include fields empty or not filled fields or when value is not provided
    
    FORMATTING RULES (!!! VERY IMPORTANT !!!):
      - Return the final result as a single clean and complete JSON object containing all the structured fields from the full document. 
      - Only return valid JSON. Do not explain or comment.
      - Return the response in the following JSON structure, keeping all original fields. The response should ve valid for JSON.parse() method. Do not include any extra text before or after the JSON structure.
      - Stick strongly to the output format.
      - Do not generate excessive newlines (\\n characters)
      - Ignore blank areas and whitespace
      
    OUTPUT FORMAT (!!! VERY IMPORTANT !!!): 
      ${JSON.stringify(responseSchema, null, 2)}
  `;
};

export const generateFaxExtractionPrompt = (): string => {
  const processingRequirements = `
    You are an expert medical document extraction assistant specializing in digitizing FAXed healthcare records for Home Health Agencies. 
    Extract all meaningful structured data from the provided FAX document with >95% accuracy for standard forms and >85% accuracy for handwritten text.
    
    DOCUMENT PROCESSING INSTRUCTIONS:
    - Perform image quality assessment and note any issues (skew, noise, poor resolution)
    - Classify document type with confidence score
    - Handle multi-document faxes by processing each separately
    - Separate cover pages from clinical documents
    - Apply enhanced processing for handwritten sections
    - Use medical context to improve recognition accuracy
    - Recognize standard medical abbreviations and terminology
    
    Your task is to locate and extract **only** the following fields—do not invent, infer, or return any other data.
  `;

  // Convert EXTRACTION_FIELDS to the expected format
  const fieldDescriptions = ALL_EXTRACTION_FIELDS
    .map(({ fieldName, format, tips }) => {
      let field = `- fieldName: ${fieldName}`;

      if (format) {
        field += ` (Expected Format: ${format})`;
      }

      if (tips) {
        field += ` (Tips: ${tips})`;
      }

      return field;
    })
    .join('\n');

  const documentTypesDescriptions = Object.values(DOCUMENT_TYPES)
    .map((documentType) => `- documentType: ${documentType}  (Tips: ${DOCUMENT_TYPE_DESCRIPTIONS[documentType]})`)
    .join('\n');

  const processingRequirementsFields = `
    Tasks:
      ${processingRequirements}
      
    Extract the following Fields (strictly these):
      ${fieldDescriptions}
      
    QUALITY CONTROL:
    - Flag fields with confidence <85% for human review
    - Validate date formats and logical date ranges
    - Verify phone numbers, zip codes, and NPI number formats
    - Check ICD-10 and CPT code validity
    - Note conflicting or duplicate information
    
    MEDICAL DOCUMENT SPECIFIC RULES:
    - For CMS-485 forms: Extract all required home health certification fields
    - For physician orders: Extract detailed medication and treatment orders
    - For insurance forms: Process authorization and benefit information
    - Maintain original medical terminology when clear
    - Cross-reference handwritten sections with printed sections for validation
    
    DOCUMENT_TYPES:
      ${documentTypesDescriptions}
  `;

  const responseSchema = {
    document_metadata: {
      document_type: 'string (from DOCUMENT_TYPES)',
      classification_confidence: 'number (0-1)',
      processing_notes: 'string',
    },
    result: {
      fields: ALL_EXTRACTION_FIELDS.map(field => ({
        fieldName: field.fieldName,
        value: '',
      })),
    },
    quality_indicators: {
      overall_confidence: 'number (0-1)',
      fields_requiring_review: ['array of field names with confidence <0.85'],
      extraction_issues: 'string noting any processing problems',
    },
    accuracy: 'number (0-100)',
  };

  const prompt = promptProcessingGenerator({
    processingRequirements: processingRequirementsFields,
    responseSchema,
  });

  return prompt;
};
