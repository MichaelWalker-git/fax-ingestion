import { IDocumentTableFilters } from '../../../types/DocumentType.ts'

const TABLE_VIEW = 'table'
const CARD_VIEW = 'card'

export const DOCUMENTS_VIEW = {
  TABLE: TABLE_VIEW,
  CARD: CARD_VIEW,
}

export type DocumentViewType = (typeof DOCUMENTS_VIEW)[keyof typeof DOCUMENTS_VIEW]

export const TABS_VALUES = {
  ALL: 'all',
  RECENT: 'recent',
  UPLOADED: 'uploaded',
  PROCESSED: 'processed',
}

export const DOCUMENTS_TABLE_HEAD = [
  { id: 'filename', label: 'Name', width: 116 },
  { id: 'status', label: 'Status', width: 140 },
  { id: 'format', label: 'Format', width: 140 },
  { id: 'updatedAt', label: 'Modified', width: 120 },
  { id: '', width: 88 },
]

export const TABS = [
  { value: 'all', label: 'All Documents', icon: 'ic_description' },
  { value: 'recent', label: 'Recent', icon: 'ic_history' },
  { value: 'uploaded', label: 'Uploaded', icon: 'ic_upload_file' },
  { value: 'processed', label: 'Processed', icon: 'processed' },
] as const

export const defaultFilters: IDocumentTableFilters = {
  status: 'all',
  format: [],
  updatedAt: null,
}
