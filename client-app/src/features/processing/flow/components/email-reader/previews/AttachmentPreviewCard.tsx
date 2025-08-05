import { Card, Stack, Typography } from '@mui/material'
import { GmailAttachmentFile } from '../../../../../../types/Gmail.ts'
import AttachmentInfoBlock from './AttachmentInfoBlock.tsx'
import { PdfViewer } from '../../../../../../shared/components/pdf-viewer/PdfViewer.tsx'
import { getFileFormat } from '../../../../../../utils/files.ts'

interface AttachmentPreviewCardProps {
  attachment: GmailAttachmentFile
}

const supportedPreviewFormat = ['pdf', 'jpg', 'jpeg', 'png']

export default function AttachmentPreviewCard({ attachment }: AttachmentPreviewCardProps) {
  const fileFormat = getFileFormat(attachment.filename)

  return (
    <Card sx={{ p: 2 }}>
      <Stack sx={{ gap: 2 }}>
        <AttachmentInfoBlock attachment={attachment} bottomPadding />
        <Stack sx={{ height: '60vh', overflowY: 'auto', overflowX: 'hidden' }}>
          {!supportedPreviewFormat.includes(fileFormat || '') ? (
            <Typography>Preview not available</Typography>
          ) : (
            <>
              {(fileFormat === 'jpg' || fileFormat === 'jpeg' || fileFormat === 'png') && (
                <img src={attachment.url} alt={attachment.filename} />
              )}
              {fileFormat === 'pdf' && <PdfViewer url={attachment.url} />}
            </>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}
