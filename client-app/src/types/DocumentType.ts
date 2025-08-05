import { PROCESSING_MODES_TYPE, PROCESSING_TYPES } from '../shared/constants/processing-constants.ts'

export interface IDocumentType {
  filename: string
  status: string
  createdAt: string
  sortKey: string
  promptResult?: {
    result: string
    accuracy: string
  }
  s3Path?: string
  isPromptUsed?: boolean
  resultS3Path?: string
  mainFileId?: string
  isHasChildren?: boolean
  processingType?: keyof typeof PROCESSING_TYPES
  updatedAt: string
  tab?: PROCESSING_MODES_TYPE
  taskId?: string
  choiceId?: string
  fileId?: string
}

export type IDocumentTableFilterValue = string | string[] | Date | null

export type IDocumentTableFilters = {
  format: string[]
  status: string
  updatedAt: Date | null
}
