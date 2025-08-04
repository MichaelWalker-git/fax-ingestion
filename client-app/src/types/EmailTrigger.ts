export interface EmailTriggerFormValues {
  from: string
  attachmentFormats: string[]
}

export interface EmailTrigger {
  active: boolean
  attachmentContentTypes: string[]
  from: string
  processAttachments: boolean
  processBody: boolean
  templateId: string
  name: string
  updatedAt: string
  sortKey: string
}

export interface EmailTriggerResult {
  sortKey: string
  from: string
  attachments: { filename: string; fileId: string; resultS3Path: string; status: string; tab: string; taskId: string }[]
  updatedAt: string
  fromAddress: string
  fromName: string
  messageId: string
  status: string
}
