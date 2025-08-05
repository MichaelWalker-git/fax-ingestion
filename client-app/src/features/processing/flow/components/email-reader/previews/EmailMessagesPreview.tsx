import { GmailMessage } from '../../../../../../types/Gmail.ts'
import { Button, InputAdornment, Modal, Paper, Stack, TextField, Typography } from '@mui/material'
import Iconify from '../../../../../../shared/components/iconify'
import { useMemo, useState } from 'react'
import MessagePreviewCard from './MessagePreviewCard.tsx'
import MessageItem from './MessageItem.tsx'

interface EmailMessagesPreviewProps {
  open: boolean
  handleClose: VoidFunction
  messages: GmailMessage[]
}

export default function EmailMessagesPreview({ messages, open, handleClose }: EmailMessagesPreviewProps) {
  const [messagePreview, setMessagePreview] = useState<GmailMessage | null>(messages[0])

  const [search, setSearch] = useState('')

  const filteredMessages = useMemo(() => {
    return messages.filter(
      (message) =>
        message.subject.toLowerCase().includes(search.toLowerCase()) ||
        message.from.toLowerCase().includes(search.toLowerCase()) ||
        message.to.toLowerCase().includes(search.toLowerCase()) ||
        message.snippet.toLowerCase().includes(search.toLowerCase()),
    )
  }, [messages, search])

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper>
        <Stack sx={{ width: '40vw' }}>
          <Typography variant="h6" p={4}>
            Emails
          </Typography>
          <Stack p={1} sx={{ bgcolor: 'background.neutral', borderRadius: 2 }} gap={1}>
            <TextField
              sx={{ backgroundColor: 'common.white', borderRadius: 1 }}
              placeholder="Search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="ic:baseline-search" />
                  </InputAdornment>
                ),
              }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Stack direction="row" gap={1}>
              <Stack sx={{ bgcolor: 'common.white', borderRadius: 1 }} width="40%" p={2} gap={0.5}>
                {filteredMessages?.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    onClick={() => setMessagePreview(message)}
                    isSelected={message.id === messagePreview?.id}
                  />
                ))}
              </Stack>
              <Stack sx={{ bgcolor: 'common.white', borderRadius: 1 }} width="60%" p={2}>
                {messagePreview && <MessagePreviewCard messageId={messagePreview.id} />}
              </Stack>
            </Stack>
          </Stack>
          <Stack p={4} alignItems="end">
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  )
}
