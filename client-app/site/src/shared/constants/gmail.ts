export const GMAIL_LABEL_IDS = {
  INBOX: 'INBOX',
  SPAM: 'SPAM',
  TRASH: 'TRASH',
  UNREAD: 'UNREAD',
  STARRED: 'STARRED',
  IMPORTANT: 'IMPORTANT',
  SENT: 'SENT',
  DRAFT: 'DRAFT',
  CATEGORY_PERSONAL: 'CATEGORY_PERSONAL',
  CATEGORY_SOCIAL: 'CATEGORY_SOCIAL',
  CATEGORY_PROMOTIONS: 'CATEGORY_PROMOTIONS',
  CATEGORY_UPDATES: 'CATEGORY_UPDATES',
  CATEGORY_FORUMS: 'CATEGORY_FORUMS',
}

export const GAMAL_LABEL_SELECT_OPTIONS = [
  {
    value: GMAIL_LABEL_IDS.INBOX,
    label: 'Inbox',
  },
  {
    value: GMAIL_LABEL_IDS.TRASH,
    label: 'Trash',
  },
  {
    value: GMAIL_LABEL_IDS.UNREAD,
    label: 'Unread',
  },
  {
    value: GMAIL_LABEL_IDS.STARRED,
    label: 'Starred',
  },
  {
    value: GMAIL_LABEL_IDS.IMPORTANT,
    label: 'Important',
  },
  {
    value: GMAIL_LABEL_IDS.SENT,
    label: 'Sent',
  },
  {
    value: GMAIL_LABEL_IDS.DRAFT,
    label: 'Draft',
  },
  {
    value: GMAIL_LABEL_IDS.CATEGORY_PERSONAL,
    label: 'Personal',
  },
  {
    value: GMAIL_LABEL_IDS.CATEGORY_SOCIAL,
    label: 'Social',
  },
  {
    value: GMAIL_LABEL_IDS.CATEGORY_PROMOTIONS,
    label: 'Promotions',
  },
  {
    value: GMAIL_LABEL_IDS.CATEGORY_UPDATES,
    label: 'Updates',
  },
  {
    value: GMAIL_LABEL_IDS.CATEGORY_FORUMS,
    label: 'Forums',
  },
]

export const SUPPORTED_CONTENT_TYPES = {
  PDF: 'application/pdf',
  JSON: 'application/json',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  TEXT: 'text/plain',
}

export const GMAIL_SUPPORTED_CONTENT_TYPES_OPTIONS = [
  {
    value: SUPPORTED_CONTENT_TYPES.PDF,
    label: 'PDF',
  },
  {
    value: SUPPORTED_CONTENT_TYPES.JSON,
    label: 'JSON',
  },
  {
    value: SUPPORTED_CONTENT_TYPES.PNG,
    label: 'PNG',
  },
  {
    value: SUPPORTED_CONTENT_TYPES.JPEG,
    label: 'JPEG',
  },
  {
    value: SUPPORTED_CONTENT_TYPES.TEXT,
    label: 'Text',
  },
]
