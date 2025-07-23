// Document Classification Categories
export const DOCUMENT_TYPES = {
  PHYSICIAN_REFERRAL: 'PHYSICIAN_REFERRAL',
  FACE_TO_FACE_ENCOUNTER: 'FACE_TO_FACE_ENCOUNTER',
  INSURANCE_AUTHORIZATION: 'INSURANCE_AUTHORIZATION',
  CLINICAL_NOTES: 'CLINICAL_NOTES',
  PRESCRIPTION_ORDERS: 'PRESCRIPTION_ORDERS',
  LABORATORY_RESULTS: 'LABORATORY_RESULTS',
  OTHER_MEDICAL: 'OTHER_MEDICAL',
} as const;

export const DOCUMENT_TYPE_DESCRIPTIONS = {
  [DOCUMENT_TYPES.PHYSICIAN_REFERRAL]: 'Physician Referrals (including specialist referrals and discharge summaries)',
  [DOCUMENT_TYPES.FACE_TO_FACE_ENCOUNTER]: 'Face-to-Face Encounter Documentation (CMS-485, physician certifications)',
  [DOCUMENT_TYPES.INSURANCE_AUTHORIZATION]: 'Insurance Authorizations (prior auth, benefit verification)',
  [DOCUMENT_TYPES.CLINICAL_NOTES]: 'Clinical Notes and Assessments (nursing notes, therapy evaluations)',
  [DOCUMENT_TYPES.PRESCRIPTION_ORDERS]: 'Prescription Orders (medication lists, drug therapy plans)',
  [DOCUMENT_TYPES.LABORATORY_RESULTS]: 'Laboratory Results (blood work, diagnostic tests)',
  [DOCUMENT_TYPES.OTHER_MEDICAL]: 'Other Medical Documentation (flag for manual review if confidence <90%)',
} as const;

// Extraction Field Interface
export interface ExtractionField {
  fieldName: string;
  tips: string;
  format: string;
  value: string;
}

// Extraction Field Names
export const FIELD_NAMES = {
  FULL_NAME: 'Full Name',
  DATE_OF_BIRTH: 'Date of Birth',
  MEDICAL_RECORD_NUMBER: 'Medical Record Number',
  SOCIAL_SECURITY_NUMBER: 'Social Security Number',
  ADDRESS: 'Address',
  PRIMARY_PHONE: 'Primary Phone',
  EMERGENCY_PHONE: 'Emergency Phone',
  GENDER: 'Gender',
  EMERGENCY_CONTACT_NAME: 'Emergency Contact Name',
  EMERGENCY_CONTACT_RELATIONSHIP: 'Emergency Contact Relationship',
  REFERRING_PHYSICIAN: 'Referring Physician Name',
  NPI_NUMBER: 'NPI Number',
  PRACTICE_NAME: 'Practice Name',
  PROVIDER_PHONE: 'Provider Phone',
  PROVIDER_FAX: 'Provider Fax',
  PROVIDER_ADDRESS: 'Provider Address',
  ORDERING_PHYSICIAN: 'Ordering Physician',
  PRIMARY_CARE_PHYSICIAN: 'Primary Care Physician',
  PRIMARY_INSURANCE: 'Primary Insurance Name',
  POLICY_MEMBER_ID: 'Policy/Member ID',
  GROUP_NUMBER: 'Group Number',
  AUTHORIZATION_NUMBER: 'Authorization Number',
  COVERAGE_START: 'Coverage Effective Date',
  COVERAGE_END: 'Coverage End Date',
  SECONDARY_INSURANCE: 'Secondary Insurance',
  MEDICARE_NUMBER: 'Medicare Number',
  MEDICAID_NUMBER: 'Medicaid Number',
  PRIMARY_DIAGNOSIS: 'Primary Diagnosis',
  SECONDARY_DIAGNOSES: 'Secondary Diagnoses',
  PROCEDURES: 'Procedures',
  CURRENT_MEDICATIONS: 'Current Medications',
  BLOOD_PRESSURE: 'Blood Pressure',
  HEART_RATE: 'Heart Rate',
  TEMPERATURE: 'Temperature',
  WEIGHT: 'Weight',
  OXYGEN_SATURATION: 'Oxygen Saturation',
  FUNCTIONAL_STATUS: 'Functional Status',
  ALLERGIES: 'Allergies',
  MEDICAL_HISTORY: 'Medical History',
  ADMISSION_DATE: 'Admission Date',
  DISCHARGE_DATE: 'Discharge Date',
  DATE_OF_SERVICE: 'Date of Service',
  ORDER_DATE: 'Order Date',
  AUTHORIZATION_START: 'Authorization Start Date',
  AUTHORIZATION_END: 'Authorization End Date',
  NEXT_APPOINTMENT: 'Next Appointment',
  FACE_TO_FACE_DATE: 'Face to Face Date',
} as const;

// Patient Demographics Fields
export const PATIENT_DEMOGRAPHICS: ExtractionField[] = [
  { fieldName: FIELD_NAMES.FULL_NAME, tips: 'Last, First, Middle Initial', format: 'LastName, FirstName MiddleInitial', value: '' },
  { fieldName: FIELD_NAMES.DATE_OF_BIRTH, tips: 'Patient birth date in various formats', format: 'MM/DD/YYYY or YYYY-MM-DD', value: '' },
  { fieldName: FIELD_NAMES.MEDICAL_RECORD_NUMBER, tips: 'All variations including MR#, MRN, Patient ID', format: 'Alphanumeric string', value: '' },
  { fieldName: FIELD_NAMES.SOCIAL_SECURITY_NUMBER, tips: 'If present, with or without dashes', format: 'XXX-XX-XXXX or XXXXXXXXX', value: '' },
  { fieldName: FIELD_NAMES.ADDRESS, tips: 'Complete address including street, city, state, zip', format: 'Street, City, State ZIP', value: '' },
  { fieldName: FIELD_NAMES.PRIMARY_PHONE, tips: 'Patient primary contact number', format: '(XXX) XXX-XXXX or XXX-XXX-XXXX', value: '' },
  { fieldName: FIELD_NAMES.EMERGENCY_PHONE, tips: 'Emergency contact phone number', format: '(XXX) XXX-XXXX or XXX-XXX-XXXX', value: '' },
  { fieldName: FIELD_NAMES.GENDER, tips: 'Patient gender designation', format: 'M/F/Other/Male/Female', value: '' },
  { fieldName: FIELD_NAMES.EMERGENCY_CONTACT_NAME, tips: 'Full name of emergency contact person', format: 'FirstName LastName', value: '' },
  { fieldName: FIELD_NAMES.EMERGENCY_CONTACT_RELATIONSHIP, tips: 'Relationship to patient', format: 'Spouse/Child/Parent/Sibling/Friend/Other', value: '' },
];

// Provider Information Fields
export const PROVIDER_INFORMATION: ExtractionField[] = [
  { fieldName: FIELD_NAMES.REFERRING_PHYSICIAN, tips: 'Full name and credentials of referring doctor', format: 'Dr. FirstName LastName, MD/DO/NP/PA', value: '' },
  { fieldName: FIELD_NAMES.NPI_NUMBER, tips: '10-digit National Provider Identifier', format: 'XXXXXXXXXX (10 digits)', value: '' },
  { fieldName: FIELD_NAMES.PRACTICE_NAME, tips: 'Medical practice or facility name', format: 'Practice/Clinic/Hospital Name', value: '' },
  { fieldName: FIELD_NAMES.PROVIDER_PHONE, tips: 'Provider contact phone number', format: '(XXX) XXX-XXXX', value: '' },
  { fieldName: FIELD_NAMES.PROVIDER_FAX, tips: 'Provider fax number', format: '(XXX) XXX-XXXX', value: '' },
  { fieldName: FIELD_NAMES.PROVIDER_ADDRESS, tips: 'Provider practice address', format: 'Street, City, State ZIP', value: '' },
  { fieldName: FIELD_NAMES.ORDERING_PHYSICIAN, tips: 'If different from referring physician', format: 'Dr. FirstName LastName, Credentials', value: '' },
  { fieldName: FIELD_NAMES.PRIMARY_CARE_PHYSICIAN, tips: 'Patient\'s primary care provider if mentioned', format: 'Dr. FirstName LastName, Credentials', value: '' },
];

// Insurance Details Fields
export const INSURANCE_DETAILS: ExtractionField[] = [
  { fieldName: FIELD_NAMES.PRIMARY_INSURANCE, tips: 'Primary insurance payer name and type', format: 'Insurance Company Name', value: '' },
  { fieldName: FIELD_NAMES.POLICY_MEMBER_ID, tips: 'Insurance identification number', format: 'Alphanumeric string', value: '' },
  { fieldName: FIELD_NAMES.GROUP_NUMBER, tips: 'Insurance group number if applicable', format: 'Alphanumeric string', value: '' },
  { fieldName: FIELD_NAMES.AUTHORIZATION_NUMBER, tips: 'Prior authorization reference number', format: 'Alphanumeric string', value: '' },
  { fieldName: FIELD_NAMES.COVERAGE_START, tips: 'Insurance coverage start date', format: 'MM/DD/YYYY', value: '' },
  { fieldName: FIELD_NAMES.COVERAGE_END, tips: 'Insurance coverage end date', format: 'MM/DD/YYYY', value: '' },
  { fieldName: FIELD_NAMES.SECONDARY_INSURANCE, tips: 'Secondary insurance if present', format: 'Insurance Company Name', value: '' },
  { fieldName: FIELD_NAMES.MEDICARE_NUMBER, tips: 'Medicare identification if applicable', format: 'XXXX-XXX-XXXX', value: '' },
  { fieldName: FIELD_NAMES.MEDICAID_NUMBER, tips: 'Medicaid identification if applicable', format: 'State-specific format', value: '' },
];

// Clinical Data Fields
export const CLINICAL_DATA: ExtractionField[] = [
  { fieldName: FIELD_NAMES.PRIMARY_DIAGNOSIS, tips: 'Main diagnosis with ICD-10 code and description', format: 'ICD-10 Code: Description', value: '' },
  { fieldName: FIELD_NAMES.SECONDARY_DIAGNOSES, tips: 'Additional conditions and comorbidities', format: 'ICD-10 Code: Description (multiple)', value: '' },
  { fieldName: FIELD_NAMES.PROCEDURES, tips: 'Medical procedures with CPT codes', format: 'CPT Code: Description', value: '' },
  { fieldName: FIELD_NAMES.CURRENT_MEDICATIONS, tips: 'All current medications with dosages', format: 'Drug name, dosage, frequency, route', value: '' },
  { fieldName: FIELD_NAMES.BLOOD_PRESSURE, tips: 'Most recent blood pressure reading', format: 'XXX/XX mmHg', value: '' },
  { fieldName: FIELD_NAMES.HEART_RATE, tips: 'Most recent heart rate', format: 'XX bpm', value: '' },
  { fieldName: FIELD_NAMES.TEMPERATURE, tips: 'Most recent temperature reading', format: 'XX.X°F or XX.X°C', value: '' },
  { fieldName: FIELD_NAMES.WEIGHT, tips: 'Patient weight', format: 'XXX lbs or XXX kg', value: '' },
  { fieldName: FIELD_NAMES.OXYGEN_SATURATION, tips: 'O2 saturation percentage', format: 'XX% on room air/oxygen', value: '' },
  { fieldName: FIELD_NAMES.FUNCTIONAL_STATUS, tips: 'ADL scores, mobility assessments', format: 'Independent/Assisted/Dependent', value: '' },
  { fieldName: FIELD_NAMES.ALLERGIES, tips: 'Drug and environmental allergies', format: 'Allergen: Reaction type', value: '' },
  { fieldName: FIELD_NAMES.MEDICAL_HISTORY, tips: 'Relevant past medical history', format: 'Chronological list of conditions', value: '' },
];

// Critical Dates and Timeline Fields
export const CRITICAL_DATES: ExtractionField[] = [
  { fieldName: FIELD_NAMES.ADMISSION_DATE, tips: 'Hospital or facility admission date', format: 'MM/DD/YYYY', value: '' },
  { fieldName: FIELD_NAMES.DISCHARGE_DATE, tips: 'Hospital or facility discharge date', format: 'MM/DD/YYYY', value: '' },
  { fieldName: FIELD_NAMES.DATE_OF_SERVICE, tips: 'When medical care was provided', format: 'MM/DD/YYYY', value: '' },
  { fieldName: FIELD_NAMES.ORDER_DATE, tips: 'When physician orders were written', format: 'MM/DD/YYYY', value: '' },
  { fieldName: FIELD_NAMES.AUTHORIZATION_START, tips: 'Insurance approval start date', format: 'MM/DD/YYYY', value: '' },
  { fieldName: FIELD_NAMES.AUTHORIZATION_END, tips: 'Insurance approval end date', format: 'MM/DD/YYYY', value: '' },
  { fieldName: FIELD_NAMES.NEXT_APPOINTMENT, tips: 'Follow-up appointment date and time', format: 'MM/DD/YYYY HH:MM AM/PM', value: '' },
  { fieldName: FIELD_NAMES.FACE_TO_FACE_DATE, tips: 'Date of face-to-face encounter for home health', format: 'MM/DD/YYYY', value: '' },
];

// Complete extraction fields object
export const EXTRACTION_FIELDS: Record<string, ExtractionField[]> = {
  PATIENT_DEMOGRAPHICS,
  PROVIDER_INFORMATION,
  INSURANCE_DETAILS,
  CLINICAL_DATA,
  CRITICAL_DATES,
} as const;

// All extraction fields
export const ALL_EXTRACTION_FIELDS: ExtractionField[] = [];

Object.entries(EXTRACTION_FIELDS).forEach(([category, fields]) => {
  ALL_EXTRACTION_FIELDS.push(...fields);
});

