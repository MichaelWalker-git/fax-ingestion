import { del, get, post } from 'aws-amplify/api'
import axios from 'axios'
import { PROCESSING_TYPES } from '../../constants/processing-constants.ts'
import { API_NAME, API_PATH_DELETE_FILES, API_PATH_FILES, API_PRESIGNER_INPUTS } from '../paths.ts'
import { IDocumentType } from '../../../types/DocumentType.ts'

export async function addDocument(file: File) {
  const restOperation = post({
    apiName: API_NAME,
    path: API_PRESIGNER_INPUTS,
    options: {
      // TODO remove processingType
      body: { filename: file.name, contentType: file.type, method: 'PUT', processingType: PROCESSING_TYPES.TEXT },
      //body: { filename: file.name, contentType: file.type, method: 'PUT' },
    },
  })
  const response = await restOperation.response
  return (await response.body.json()) as { uploadUrl?: string; message?: string; fileId?: string }
}

export async function uploadDocument(uploadUrl: string, file: File) {
  return axios
    .request({
      url: uploadUrl,
      method: 'PUT',
      headers: {
        'Content-type': file.type,
      },
      data: file,
    })
    .catch((error) => {
      console.error('File upload failed', error)
    })
}

export async function getDocuments(uploadedFroms?: string[]) {
  const restOperation = get({
    apiName: API_NAME,
    path: `${API_PATH_FILES}${uploadedFroms ? `?uploadedFrom=${uploadedFroms.join('&uploadedFrom=')}` : ''}`,
  })
  const response = await restOperation.response
  const responseBody = (await response.body.json()) as unknown as { items: IDocumentType[] }
  const filteredDocuments = responseBody.items?.filter((document) => !document.mainFileId)

  return filteredDocuments
}

export async function getDocument(documentId: string) {
  const restOperation = get({
    apiName: API_NAME,
    path: `${API_PATH_FILES}/${documentId}`,
  })
  const response = await restOperation.response
  const responseBody = (await response.body.json()) as unknown as { item: IDocumentType }
  return responseBody.item as IDocumentType
}

export async function deleteDocument(documentId: string) {
  return await del({
    apiName: API_NAME,
    path: `${API_PATH_FILES}/${documentId}`,
  }).response
}

export async function deleteDocuments(documentIds: string[]) {
  return await post({
    apiName: API_NAME,
    path: API_PATH_DELETE_FILES,
    options: {
      body: { fileIds: documentIds },
    },
  }).response
}

export const fetchChildDocuments = (parentDocumentId: string) => async () => {
  const restOperation = get({
    apiName: API_NAME,
    path: `${API_PATH_FILES}?mainFileId=${parentDocumentId}`,
  })
  const response = await restOperation.response
  const responseBody = (await response.body.json()) as unknown as { items: IDocumentType[] }

  const filteredDocuments = responseBody.items.filter((document: IDocumentType) => !!document.mainFileId)

  filteredDocuments.sort((a: IDocumentType, b: IDocumentType) => {
    if (a.filename < b.filename) {
      return -1
    }
    if (a.filename > b.filename) {
      return 1
    }
    return 0
  })

  return filteredDocuments
}
