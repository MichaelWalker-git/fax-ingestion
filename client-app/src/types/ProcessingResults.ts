import { FormField } from './DocumentProcessing.ts'
import { Table } from './Table.ts'

export interface SimpleFormProcessingResult {
  result: {
    fields: FormField[]
  }
}

interface BasicResultFields {
  accuracy: string
  status: string
  page: number
}

export interface MapFormProcessingResult extends BasicResultFields {
  result: {
    fields: FormField[]
  }
}

export interface MapTableProcessingResult extends BasicResultFields {
  result: Table[]
}

export interface MapQAProcessingResult extends BasicResultFields {
  result: string
}

export interface ProcessingResult {
  resultS3Path?: string
  filename: string
  sortKey: string
  updatedAt: string
  promptResult?: string
  tab?: string
  status?: string
}
