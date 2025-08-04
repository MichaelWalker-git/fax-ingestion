export interface GmailFiltersFormValues {
  labels: string[]
  from: string
  attachmentFormats: string[]
  includeSpam: boolean
  numberToRead: number
}

export type RefreshTokenUrlResponse = {
  refreshTokenUrl: string
  message: string
}

export interface IGmailGetMessagesQueryParams {
  query?: string
  maxResults?: string
  labelIds?: string
  includeSpamTrash?: string
  attachmentFormats?: string
}

export interface GmailMessage {
  id: string
  labelIds: string[]
  snippet: string
  to: string
  date: string
  from: string
  subject: string
  attachments: any[]
  fromName: string
  bodyBase64: string
}

export interface GmailProfile {
  emailAddress: string
  messagesTotal: number
  threadsTotal: number
  historyId: string
}

export interface GmailAttachment {
  attachmentId: string
  contentTransferEncoding: string
  contentType: string
  filename: string
  sizeEstimate: string
}

export interface GmailAttachmentFile {
  fileId: string
  filename: string
  url: string
  from: string
}

export interface GmailSendMessageRequest {
  to: string
  subject: string
  body: string
  attachments?: GmailSendMessageRequestAttachment[]
}

export interface GmailSendMessageRequestAttachment {
  attachmentFilename: string
  fileId?: string
  attachResultFile: boolean
  attachFile: boolean
}
