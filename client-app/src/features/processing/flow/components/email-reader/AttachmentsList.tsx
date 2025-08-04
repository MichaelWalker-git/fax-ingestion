import { GmailAttachmentFile } from '../../../../../types/Gmail.ts'
import { Button, CircularProgress, FormControlLabel, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Iconify from '../../../../../shared/components/iconify'
import { useState } from 'react'
import FileLabel from '../../../../../shared/components/file-label/FileLabel.tsx'
import EmailAttachmentPreview from './previews/EmailAttachmentPreview.tsx'
import EmailAttachmentsPreview from './previews/EmailAttachmentsPreview.tsx'
import { useBoolean } from '../../../../../shared/hooks/useBoolean.ts'
import { useSelectAttachment } from '../../hooks/useSelectAttachment.ts'
import Checkbox from '@mui/material/Checkbox'

interface AttachmentsListProps {
  attachments?: GmailAttachmentFile[]
  isLoading?: boolean
}

export default function AttachmentsList({ attachments, isLoading }: AttachmentsListProps) {
  const theme = useTheme()
  const [attachmentPreview, setAttachmentPreview] = useState<GmailAttachmentFile | null>(null)
  const allAttachmentsPreview = useBoolean()

  const { selectedAll, handleSelectAll, handleSelect, isSelected } = useSelectAttachment({ attachments: attachments })

  return (
    <>
      {isLoading && (
        <Stack justifyContent="center" alignItems="center" gap={2} flex={1}>
          <CircularProgress />
          <Stack alignItems="center">
            <Typography variant="caption">Processing your attachments</Typography>
            <Typography variant="caption" color="textSecondary">
              This may take a few seconds
            </Typography>
          </Stack>
        </Stack>
      )}
      {!attachments?.length && !isLoading && (
        <Stack justifyContent="center" alignItems="center" gap={2} flex={1}>
          <Typography variant="caption" color="textSecondary">
            Nothing to show at the moment
          </Typography>
        </Stack>
      )}
      {attachments?.length && !isLoading && (
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
          <Button
            startIcon={<Iconify icon="ic:baseline-visibility" sx={{ cursor: 'pointer' }} />}
            onClick={allAttachmentsPreview.onTrue}
            sx={{ flexShrink: 0 }}
          >
            Review All
          </Button>
        </Stack>
      )}

      {attachments && (
        <Stack maxHeight="500px" overflow="auto">
          {attachments.map((attachment) => (
            <Stack
              key={`${attachment.fileId}`}
              direction="row"
              sx={{ maxWidth: 360, borderBottom: `dashed 1px ${theme.palette.divider}`, py: 2, pr: 2, pl: 1 }}
              justifyContent="space-between"
              alignItems="center"
            >
              <Checkbox
                checked={isSelected(attachment.fileId)}
                onClick={(event) => {
                  event.stopPropagation()
                  handleSelect(attachment.fileId)
                }}
                sx={{ alignSelf: 'start' }}
              />
              <FileLabel filename={attachment.filename} />
              <Typography sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '50%' }}>
                {attachment.filename}
              </Typography>
              <Iconify
                icon="ic:baseline-visibility"
                color="text.secondary"
                sx={{ cursor: 'pointer' }}
                onClick={() => setAttachmentPreview(attachment)}
              />
            </Stack>
          ))}
        </Stack>
      )}
      {!!attachmentPreview && (
        <EmailAttachmentPreview
          open={!!attachmentPreview}
          handleClose={() => setAttachmentPreview(null)}
          attachment={attachmentPreview}
        />
      )}
      {attachments && (
        <EmailAttachmentsPreview
          attachments={attachments!}
          open={allAttachmentsPreview.value}
          handleClose={allAttachmentsPreview.onFalse}
        />
      )}
    </>
  )
}
