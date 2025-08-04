import { Button, CircularProgress, Stack, Typography } from '@mui/material'
import Iconify from '../../../../../shared/components/iconify'
import { GmailMessage } from '../../../../../types/Gmail.ts'
import { useTheme } from '@mui/material/styles'
import EmailMessagePreview from './previews/EmailMessagePreview.tsx'
import { useState } from 'react'
import { useBoolean } from '../../../../../shared/hooks/useBoolean.ts'
import EmailMessagesPreview from './previews/EmailMessagesPreview.tsx'

interface MessageListProps {
  messages?: GmailMessage[]
  isLoading?: boolean
}

export default function MessagesList({ messages, isLoading }: MessageListProps) {
  const [messagePreview, setMessagePreview] = useState<GmailMessage | null>(null)
  const allMessagesPreview = useBoolean()

  const theme = useTheme()
  return (
    <>
      {isLoading && (
        <Stack justifyContent="center" alignItems="center" gap={2} flex={1}>
          <CircularProgress />
          <Stack alignItems="center">
            <Typography variant="caption">Processing your emails</Typography>
            <Typography variant="caption" color="textSecondary">
              This may take a few seconds
            </Typography>
          </Stack>
        </Stack>
      )}
      {!messages?.length && !isLoading && (
        <Stack justifyContent="center" alignItems="center" gap={2} flex={1}>
          <Typography variant="caption" color="textSecondary">
            Nothing to show at the moment
          </Typography>
        </Stack>
      )}
      {messages && messages.length > 0 && (
        <Stack maxHeight="500px" overflow="auto" className="nodrag nowheel">
          {messages.map((message) => (
            <Stack
              key={message.id}
              direction="row"
              sx={{ maxWidth: 360, borderBottom: `dashed 1px ${theme.palette.divider}`, p: 1 }}
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2">{message.from}</Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {message.subject}
                </Typography>
              </Stack>
              <Stack direction="row" gap={2}>
                {message.attachments.length > 0 && <Iconify icon="eva:attach-2-fill" color="text.secondary" />}
                <Iconify
                  icon="ic:baseline-visibility"
                  color="text.secondary"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setMessagePreview(message)}
                />
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}
      {messages && messages.length > 0 && (
        <Stack direction="row" justifyContent="flex-end" p={1} sx={{ cursor: 'pointer' }}>
          <Button
            startIcon={<Iconify icon="ic:baseline-visibility" sx={{ cursor: 'pointer' }} />}
            onClick={allMessagesPreview.onTrue}
          >
            Review All
          </Button>
        </Stack>
      )}
      {!!messagePreview && (
        <EmailMessagePreview
          open={!!messagePreview}
          handleClose={() => setMessagePreview(null)}
          message={messagePreview}
        />
      )}
      <EmailMessagesPreview
        open={allMessagesPreview.value}
        handleClose={allMessagesPreview.onFalse}
        messages={messages || []}
      />
    </>
  )
}
