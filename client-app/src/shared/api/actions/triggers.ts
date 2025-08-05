import { del, get, put } from 'aws-amplify/api'
import { API_NAME, API_TRIGGER } from '../paths.ts'
import { EmailTrigger } from '../../../types/EmailTrigger.ts'

export async function getTriggers() {
  const restOperation = get({
    apiName: API_NAME,
    path: API_TRIGGER,
  })
  const response = await restOperation.response
  return ((await response.body.json()) as unknown as { items: EmailTrigger[] })?.items
}

export async function getTrigger(triggerId: string) {
  const restOperation = get({
    apiName: API_NAME,
    path: `${API_TRIGGER}/${triggerId}`,
  })

  const response = await restOperation.response
  return ((await response.body.json()) as unknown as { item: EmailTrigger })?.item
}

export async function deleteTrigger(triggerId: string) {
  const restOperation = del({
    apiName: API_NAME,
    path: `${API_TRIGGER}/${triggerId}`,
  })
  await restOperation.response
}

export async function updateTrigger(triggerId: string, trigger: Partial<EmailTrigger>) {
  const restOperation = await put({
    apiName: API_NAME,
    path: `${API_TRIGGER}/${triggerId}`,
    options: {
      body: trigger as unknown as FormData,
    },
  })

  const response = await restOperation.response
  return await response.body.json()
}
