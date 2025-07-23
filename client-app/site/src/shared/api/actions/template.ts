import { ProcessingFlowTemplate } from '../../../types/ProcessingFlow.ts'
import { del, get, post, put } from 'aws-amplify/api'
import { API_NAME, API_TEMPLATE } from '../paths.ts'
import { Template } from '../../../types/Template.ts'

export const saveTemplate = async (template: { template: ProcessingFlowTemplate }) => {
  const response = await post({
    apiName: API_NAME,
    path: API_TEMPLATE,
    options: {
      body: template as unknown as FormData,
    },
  }).response

  return await response.body.json()
}

export const getTemplates = async (triggerOnEmail: boolean | undefined = false) => {
  const restOperation = get({
    apiName: API_NAME,
    path: `${API_TEMPLATE}`
      ? triggerOnEmail
        ? `${API_TEMPLATE}?triggerOnEmail=${triggerOnEmail}`
        : `${API_TEMPLATE}`
      : '',
  })
  const response = await restOperation.response
  return ((await response.body.json()) as unknown as { items: Template[] })?.items
}

export const getTemplate = async (templateId: string) => {
  const restOperation = get({
    apiName: API_NAME,
    path: `${API_TEMPLATE}/${templateId}`,
  })
  const response = await restOperation.response
  return ((await response.body.json()) as unknown as { item: Template })?.item
}

export const deleteTemplate = async (templateId: string) => {
  del({
    apiName: API_NAME,
    path: `${API_TEMPLATE}/${templateId}`,
  }).response
}

export const updateTemplate = async (templateId: string, template: Template) => {
  const response = await put({
    apiName: API_NAME,
    path: `${API_TEMPLATE}/${templateId}`,
    options: {
      body: template as unknown as FormData,
    },
  }).response
  return response
}
