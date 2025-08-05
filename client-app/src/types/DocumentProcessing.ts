import { PROCESSING_TYPES } from '../shared/constants/processing-constants.ts'
import { IDocumentType } from './DocumentType.ts'
import { ChildDocumentsPreviewUrls } from './Preview.ts'
import { IFormSchema, ITableSchema } from './Scema.ts'

export interface IProcessingContext {
  processingDocument: IDocumentType | undefined
  setProcessingDocument?: (document: IDocumentType | undefined) => void
  prompt?: string
  setPrompt?: (prompt: string) => void
  processingError?: string
  setProcessingError: (processingError: string) => void
  mode?: string
  setMode?: (mode: string) => void
  setDisabledNextStep: (disabledNextStep: boolean) => void
  disabledNextStep: boolean
  formSchema?: IFormSchema
  setFormSchema: (schema: IFormSchema) => void
  tableSchema?: ITableSchema
  setTableSchema: (schema: ITableSchema) => void
  parentDocument?: IDocumentType
  setParentDocument?: (parentDocument: IDocumentType | undefined) => void
  previewUrl?: string
  setPreviewUrl?: (previewUrl: string | undefined) => void
  childDocumentsPreviewUrls: ChildDocumentsPreviewUrls
  setChildDocumentsPreviewUrls?: (
    childDocumentsPreviewUrls: (prevState: ChildDocumentsPreviewUrls) => ChildDocumentsPreviewUrls,
  ) => void
  isValidationError?: boolean
  setIsValidationError?: (isValidationError: boolean) => void
  isRunning?: boolean
  setIsRunning: (isRunning: boolean) => void
  isProcessingStarting?: boolean
  setIsProcessingStarting: (isRunning: boolean) => void
  selectedPages: string[]
  setSelectedPages: (selectedPages: ((prevState: string[]) => any) | string[]) => void
  selectAll: boolean
  setSelectAll: (selectAll: ((prevState: boolean) => boolean) | boolean) => void
}

export type PROCESSING_TYPES_TYPE = (typeof PROCESSING_TYPES)[keyof typeof PROCESSING_TYPES]

export interface FormField {
  fieldName: string
  fieldNumber: string
  fieldValue: string
  accuracy: string
}
