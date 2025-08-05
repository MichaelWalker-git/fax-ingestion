import { get, post } from 'aws-amplify/api'
import { ProcessingFlowTemplate } from '../../../types/ProcessingFlow.ts'
import {
  API_NAME,
  API_PATH_PROCESSING,
  API_PATH_PROCESSING_MULTIFILE_RAG,
  API_PATH_PROCESSING_MULTIFILE_RAG_RESULT,
  API_PATH_PROCESSING_RAG,
  API_PATH_TEXT_EXTRACTION_PROCESSING,
  API_PATH_TEXT_EXTRACTION_PROCESSING_MULTIFILE,
  API_PROCESSING_TEMPLATE,
  API_PROCESSING_TEMPLATE_RAG,
} from '../paths.ts'
import { PROCESSING_MODES_TYPE } from '../../constants/processing-constants.ts'
import { IFormSchema, ITableSchema } from '../../../types/Scema.ts'
import { IDocumentType } from '../../../types/DocumentType.ts'

export const runProcessingTemplate = async (template: { template: ProcessingFlowTemplate }) => {
  const response = await post({
    apiName: API_NAME,
    path: API_PROCESSING_TEMPLATE,
    options: {
      body: template as unknown as FormData,
    },
  }).response

  return await response.body.json()
}

export const runProcessingTemplateRag = async (template: ProcessingFlowTemplate, parentFileId?: string) => {
  const response = await post({
    apiName: API_NAME,
    path: API_PROCESSING_TEMPLATE_RAG,
    options: {
      body: { template, parentFileId } as unknown as FormData,
    },
  }).response

  return await response.body.json()
}

export const runProcessing = async (body: {
  fileId: string
  prompt?: string
  tab: PROCESSING_MODES_TYPE
  schema?: IFormSchema | ITableSchema
}) => {
  const response = await post({
    apiName: API_NAME,
    path: API_PATH_PROCESSING,
    options: {
      body: body as unknown as FormData,
    },
  }).response

  return await response.body.json()
}

export const runProcessingRag = async (body: {
  fileId: string
  prompt?: string
  tab: PROCESSING_MODES_TYPE
  schema?: IFormSchema | ITableSchema
}) => {
  const response = await post({
    apiName: API_NAME,
    path: API_PATH_PROCESSING_RAG,
    options: {
      body: body as unknown as FormData,
    },
  }).response

  return await response.body.json()
}

export const runProcessingRagMultiFile = async (body: {
  fileIds: string[]
  prompt?: string
  tab: PROCESSING_MODES_TYPE
  schema?: IFormSchema | ITableSchema
}) => {
  const response = await post({
    apiName: API_NAME,
    path: API_PATH_PROCESSING_MULTIFILE_RAG,
    options: {
      body: body as unknown as FormData,
    },
  }).response

  return (await response.body.json()) as { fileSetId: string }
}

export async function getRagMultiFileResult(documentId: string) {
  const restOperation = get({
    apiName: API_NAME,
    path: `${API_PATH_PROCESSING_MULTIFILE_RAG_RESULT}/${documentId}`,
  })
  const response = await restOperation.response
  const responseBody = (await response.body.json()) as unknown as { item: IDocumentType }
  return responseBody.item as IDocumentType
}

export const runProcessingRagTextExtraction = async (body: {
  fileId: string
  prompt?: string
  tab: PROCESSING_MODES_TYPE
  schema?: IFormSchema | ITableSchema
  inputFileKeyId?: string
}) => {
  const response = await post({
    apiName: API_NAME,
    path: API_PATH_TEXT_EXTRACTION_PROCESSING,
    options: {
      body: body as unknown as FormData,
    },
  }).response

  return await response.body.json()
}

export const runProcessingRagTextExtractionMultiFile = async (body: {
  fileIds: string[]
  prompt?: string
  tab: PROCESSING_MODES_TYPE
  schema?: IFormSchema | ITableSchema
}) => {
  const response = await post({
    apiName: API_NAME,
    path: API_PATH_TEXT_EXTRACTION_PROCESSING_MULTIFILE,
    options: {
      body: body as unknown as FormData,
    },
  }).response

  return (await response.body.json()) as { fileSetId: string }
}
