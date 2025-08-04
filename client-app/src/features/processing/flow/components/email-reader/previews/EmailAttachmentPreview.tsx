import { GmailAttachmentFile } from '../../../../../../types/Gmail.ts'
import { Button, Modal, Paper, Stack, Typography } from '@mui/material'
import AttachmentPreviewCard from './AttachmentPreviewCard.tsx'

interface EmailAttachmentPreviewProps {
  open: boolean
  handleClose: VoidFunction
  attachment: GmailAttachmentFile
}

export default function EmailAttachmentPreview({ attachment, open, handleClose }: EmailAttachmentPreviewProps) {
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
            Attachment
          </Typography>
          <Stack p={1} sx={{ bgcolor: 'background.neutral', borderRadius: 2 }}>
            <AttachmentPreviewCard attachment={attachment} />
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
