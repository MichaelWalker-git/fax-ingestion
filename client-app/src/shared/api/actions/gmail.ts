import { get, post } from 'aws-amplify/api'
import {
  API_GMAIL_ATTACHMENTS,
  API_GMAIL_CALLBACK,
  API_GMAIL_MESSAGES,
  API_GMAIL_PROFILE,
  API_GMAIL_SIGN_OUT,
  API_NAME,
} from '../paths.ts'
import {
  GmailAttachment,
  GmailAttachmentFile,
  GmailMessage,
  GmailProfile,
  GmailSendMessageRequest,
  IGmailGetMessagesQueryParams,
  RefreshTokenUrlResponse,
} from '../../../types/Gmail.ts'

export async function getGmailTokenUrl() {
  const restOperation = get({
    apiName: API_NAME,
    path: API_GMAIL_CALLBACK,
  })
  const response = await restOperation.response
  const responseBody = await response.body.json()
  return responseBody as RefreshTokenUrlResponse
}

export async function getGmailMessages({
  maxResults,
  labelIds,
  includeSpamTrash,
  query,
  attachmentFormats,
}: IGmailGetMessagesQueryParams) {
  const restOperation = get({
    apiName: API_NAME,
    path: `${API_GMAIL_MESSAGES}?maxResults=${maxResults}&includeSpamTrash=${includeSpamTrash}${
      labelIds ? `&labelIds=${labelIds}` : ''
    }${query ? `&query=${query}` : ''}${attachmentFormats ? `&attachmentFormats=${attachmentFormats}` : ''}`,
  })
  const response = await restOperation.response
  const responseBody = (await response.body.json()) as unknown as { messages: GmailMessage[] }
  return responseBody?.messages
}

export async function getGmailMessage(messageId: string) {
  const restOperation = get({
    apiName: API_NAME,
    path: `${API_GMAIL_MESSAGES}/${messageId}`,
  })
  const response = await restOperation.response
  const responseBody = (await response.body.json()) as unknown as { message: GmailMessage }
  return responseBody.message
}

export async function getGmailProfile() {
  const restOperation = get({
    apiName: API_NAME,
    path: API_GMAIL_PROFILE,
  })
  const response = await restOperation.response
  const responseBody = (await response.body.json()) as unknown as { profile: GmailProfile }
  return responseBody?.profile
}

export async function gmailSignOut() {
  const restOperation = post({
    apiName: API_NAME,
    path: API_GMAIL_SIGN_OUT,
  })
  const response = await restOperation.response
  const responseBody = await response.body.json()
  return responseBody
}

export async function getGmailAttachments(body: { messages: { messageId: string; attachments: GmailAttachment[] }[] }) {
  const restOperation = post({
    apiName: API_NAME,
    path: API_GMAIL_ATTACHMENTS,
    options: {
      // @ts-ignore
      body: body,
    },
  })
  const response = await restOperation.response
  const responseBody = (await response.body.json()) as unknown as {
    messages: { messageId: string; files: GmailAttachmentFile[] }[]
  }

  const responseAattachments = responseBody.messages?.reduce(
    // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
    (acc, item) => [...acc, ...item.files],
    [] as GmailAttachmentFile[],
  )
  return responseAattachments
}

export async function sendGmailMessage(body: GmailSendMessageRequest) {
  const restOperation = post({
    apiName: API_NAME,
    path: API_GMAIL_MESSAGES,
    options: {
      body: body as Record<string, any>,
    },
  })
  return await restOperation.response
}
