import { Column } from './Table.ts'

export interface IFormSchema {
  fields: IField[]
}

export type ITableSchema = Column[]

export interface IField {
  fieldName: string
  fieldNumber: string
  fieldValue: string
  fieldType?: string
}
