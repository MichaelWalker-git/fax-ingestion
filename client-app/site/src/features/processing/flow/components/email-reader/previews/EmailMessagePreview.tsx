import { Button, Modal, Paper, Stack, Typography } from '@mui/material'
import { GmailMessage } from '../../../../../../types/Gmail.ts'
import MessagePreviewCard from './MessagePreviewCard.tsx'

interface EmailMessagePreviewProps {
  open: boolean
  handleClose: VoidFunction
  message: GmailMessage | null
}

export default function EmailMessagePreview({ open, handleClose, message }: EmailMessagePreviewProps) {
  if (!message) {
    return null
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper>
        <Stack sx={{ width: '30vw' }}>
          <Typography variant="h6" p={4}>
            Email
          </Typography>
          <Stack p={1} sx={{ bgcolor: 'background.neutral', borderRadius: 2 }}>
            <MessagePreviewCard messageId={message.id} />
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
