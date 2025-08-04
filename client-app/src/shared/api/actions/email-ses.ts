import { get, post } from 'aws-amplify/api'
import { API_EMAIL_SES_SUBSCRIBE, API_GET_EMAIL_SES_MESSAGES, API_NAME } from '../paths.ts'
import { EmailTriggerResult } from '../../../types/EmailTrigger.ts'

export async function emailSesSubscribe() {
  const restOperation = post({
    apiName: API_NAME,
    path: API_EMAIL_SES_SUBSCRIBE,
  })

  const response = await restOperation.response

  const responseBody = (await response.body.json()) as unknown as {
    email: string
  }

  return responseBody
}
export async function getSesEmailMessages(templateId: string, from: string) {
  const restOperation = get({
    apiName: API_NAME,
    path: `${API_GET_EMAIL_SES_MESSAGES}?templateId=${templateId}&from=${from}`,
  })

  const response = await restOperation.response
  return ((await response.body.json()) as unknown as { messages: EmailTriggerResult[] }).messages
}
