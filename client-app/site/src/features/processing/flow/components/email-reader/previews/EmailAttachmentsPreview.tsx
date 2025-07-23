import {
  Box,
  Button,
  Card,
  FormControlLabel,
  InputAdornment,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AttachmentPreviewCard from './AttachmentPreviewCard.tsx'
import Iconify from '../../../../../../shared/components/iconify'
import { useState } from 'react'
import { GmailAttachmentFile } from '../../../../../../types/Gmail.ts'
import AttachmentInfoBlock from './AttachmentInfoBlock.tsx'
import Checkbox from '@mui/material/Checkbox'
import { useSelectAttachment } from '../../../hooks/useSelectAttachment.ts'

interface EmailAttachmentPreviewProps {
  open: boolean
  handleClose: VoidFunction
  attachments: GmailAttachmentFile[]
}

export default function EmailAttachmentsPreview({ open, handleClose, attachments }: EmailAttachmentPreviewProps) {
  const [search, setSearch] = useState('')

  const [fileToPreview, setFileToPreview] = useState<GmailAttachmentFile>(attachments[0])

  const filteredAttachments = attachments.filter(
    (attachment) =>
      attachment.filename.toLowerCase().includes(search.toLowerCase()) ||
      attachment.from.toLowerCase().includes(search.toLowerCase()),
  )

  const { selectedAll, handleSelectAll, handleSelect, isSelected } = useSelectAttachment({
    attachments: filteredAttachments,
  })

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper>
        <Stack sx={{ width: '62vw', maxHeight: '90vh' }}>
          <Typography variant="h6" p={4}>
            Attachments
          </Typography>
          <Stack p={1} sx={{ bgcolor: 'background.neutral', borderRadius: 2, gap: 1, flexGrow: 1, overflow: 'auto' }}>
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
              <Card sx={{ width: '40%' }}>
                <Stack sx={{ p: 2, gap: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <FormControlLabel
                      control={<Checkbox checked={selectedAll} onClick={handleSelectAll} />}
                      label="Select all"
                      slotProps={{ typography: { variant: 'subtitle2' } }}
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          typography: 'subtitle2',
                        },
                      }}
                    />
                  </Stack>
                  {filteredAttachments.map((attachment) => (
                    <Stack
                      direction="row"
                      key={`${attachment.fileId}-${selectedAll}`}
                      sx={{
                        py: 1,
                        tr: 1,
                        cursor: 'pointer',
                        ':hover': { bgcolor: 'action.hover' },
                        bgcolor: attachment.fileId === fileToPreview.fileId ? 'action.selected' : 'common.white',
                        borderRadius: 1,
                      }}
                      onClick={() => setFileToPreview(attachment)}
                    >
                      <Checkbox
                        checked={isSelected(attachment.fileId)}
                        onClick={(event) => {
                          event.stopPropagation()
                          handleSelect(attachment.fileId)
                        }}
                        sx={{ alignSelf: 'start' }}
                      />
                      <AttachmentInfoBlock attachment={attachment} />
                    </Stack>
                  ))}
                </Stack>
              </Card>
              <Box width="68%">
                <AttachmentPreviewCard attachment={fileToPreview} />
              </Box>
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
