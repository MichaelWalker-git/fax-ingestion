import { GmailAttachmentFile, GmailMessage } from '../../../../../types/Gmail.ts'
import { Stack, Tab, Tabs } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { ATTACHMENT_TAB, EMAIL_TAB } from './constants/constants.ts'
import MessagesList from './MessagesList.tsx'
import AttachmentsList from './AttachmentsList.tsx'

interface EmailMessagesProps {
  messages?: GmailMessage[]
  isMessagesLoading?: boolean
  attachments?: GmailAttachmentFile[]
  isAttachmentsLoading?: boolean
}

export default function EmailMessages({
  messages,
  isMessagesLoading,
  attachments,
  isAttachmentsLoading,
}: EmailMessagesProps) {
  const [tab, setTab] = useState(EMAIL_TAB.value)

  const theme = useTheme()

  return (
    <Stack flex={1} sx={{ border: `dashed 1px ${theme.palette.divider}`, borderRadius: 1, p: 1.5 }} gap={2}>
      <Tabs
        value={tab}
        onChange={(_event: React.SyntheticEvent, newValue: string) => setTab(newValue)}
        sx={{
          boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
        }}
      >
        <Tab key={EMAIL_TAB.value} value={EMAIL_TAB.value} label={EMAIL_TAB.label} iconPosition="start" />
        <Tab
          key={ATTACHMENT_TAB.value}
          value={ATTACHMENT_TAB.value}
          label={ATTACHMENT_TAB.label}
          iconPosition="start"
        />
        ))
      </Tabs>
      {tab === EMAIL_TAB.value && <MessagesList messages={messages} isLoading={isMessagesLoading} />}
      {tab === ATTACHMENT_TAB.value && (
        <AttachmentsList attachments={attachments} isLoading={isAttachmentsLoading || isMessagesLoading} />
      )}
    </Stack>
  )
}
