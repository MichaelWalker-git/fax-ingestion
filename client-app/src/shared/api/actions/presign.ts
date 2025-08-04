import { post } from 'aws-amplify/api'
import { API_NAME, API_PRESIGNER_INPUTS, API_PRESIGNER_OUTPUTS } from '../paths.ts'
import { PROCESSING_TYPES } from '../../constants/processing-constants.ts'

export const getInputPresignGet = async (filename: string, s3Path: string, fileId: string) => {
  const restOperation = post({
    apiName: API_NAME,
    path: API_PRESIGNER_INPUTS,
    options: {
      body: {
        files: [
          {
            filename,
            method: 'GET',
            s3Path,
            fileId,
          },
        ],
      },
    },
  })
  const response = await restOperation.response
  const responseBody = (await response.body.json()) as unknown as {
    presignedUrls: { getUrl?: string; contentType?: string; fileId?: string; filename: string; message?: string }[]
  }
  return responseBody.presignedUrls[0]
}

export const getInputPresignsPut = async (files: { name: string; type: string }[]) => {
  const restOperation = post({
    apiName: API_NAME,
    path: API_PRESIGNER_INPUTS,
    options: {
      // TODO: remove processingType
      body: {
        files: files.map((file) => ({
          filename: file.name,
          contentType: file.type,
          method: 'PUT',
          processingType: PROCESSING_TYPES.TEXT,
        })),
      },
    },
  })
  const response = await restOperation.response
  const responseBody = (await response.body.json()) as unknown as {
    presignedUrls: { putUrl?: string; contentType?: string; fileId?: string; filename: string; message?: string }[]
  }

  return responseBody.presignedUrls
}

export const fetchResultPresignedUrl = (files: { resultS3Path?: string; filename: string }[]) => async () => {
  const restOperation = post({
    apiName: API_NAME,
    path: API_PRESIGNER_OUTPUTS,
    options: {
      body: {
        files: files.map((file) => ({ s3Path: file.resultS3Path || '', method: 'GET', filename: file.filename })),
      },
    },
  })

  const response = await restOperation.response
  const responseBody = (await response.body.json()) as {
    presignedUrls: { getUrl?: string; message?: string; filename: string }[]
  }
  return responseBody?.presignedUrls
}
