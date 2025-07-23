import { Stack, Typography } from '@mui/material'
import FileThumbnail from '../../../../../../shared/components/file-thumbnail'
import { getFileFormat } from '../../../../../../utils/files.ts'
import { useTheme } from '@mui/material/styles'
import { GmailAttachmentFile } from '../../../../../../types/Gmail.ts'

interface AttachmentPreviewCardProps {
  attachment: GmailAttachmentFile
  bottomPadding?: boolean
}

export default function AttachmentInfoBlock({ attachment, bottomPadding }: AttachmentPreviewCardProps) {
  const fileFormat = getFileFormat(attachment.filename)
  const theme = useTheme()

  return (
    <Stack
      direction="row"
      sx={{
        gap: 2.5,
        pb: bottomPadding ? 2.5 : 1,
        borderBottom: `dashed 1px ${theme.palette.divider}`,
        alignItems: 'center',
      }}
    >
      <FileThumbnail file={fileFormat || ''} sx={{ width: 64, height: 64, mr: 1 }} />
      <Stack>
        <Typography variant="subtitle1" sx={{ lineBreak: 'anywhere' }}>
          {attachment.filename}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {attachment.from}
        </Typography>
      </Stack>
    </Stack>
  )
}
