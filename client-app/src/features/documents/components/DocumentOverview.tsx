import { alpha } from '@mui/material/styles'
import { Card, Divider, Paper, Stack, Typography } from '@mui/material'
import { IDocumentType } from '../../../types/DocumentType.ts'
import { getFileFormat } from '../../../utils/files.ts'
import FileThumbnail from '../../../shared/components/file-thumbnail'
import Label from '../../../shared/components/label'
import { FILE_STATUSES } from '../../../shared/constants/file-constants.ts'
import DocumentDetails from './DocumentDetails.tsx'
import { use } from 'react'
import { ProcessingContext } from '../../processing/tab/context/ProcessingContext.tsx'
import DocumentPreview from './DocumentPreview.tsx'

interface DocumentOverviewProps {
  document?: IDocumentType
}

export default function DocumentOverview({ document }: DocumentOverviewProps) {
  const { childDocumentsPreviewUrls } = use(ProcessingContext)

  if (!document) {
    return null
  }

  const { status } = document

  const previews = Object.keys(childDocumentsPreviewUrls).map((key) => childDocumentsPreviewUrls[key].url) as string[]

  const fileFormat = getFileFormat(document.filename)

  return (
    <Paper
      sx={{
        p: 1,
        minHeight: 120,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
        width: '100%',
      }}
    >
      <Stack direction="row" gap={1}>
        <Card sx={{ width: '35%', maxHeight: '1400px', overflow: 'auto', p: 2 }}>
          <Stack gap={3}>
            <Stack direction="row" justifyContent="space-between">
              <FileThumbnail file={fileFormat || ''} sx={{ width: 64, height: 64, mr: 1 }} />
              <Label
                variant="soft"
                color={
                  (status === FILE_STATUSES.UPLOADED && 'success') ||
                  (status === FILE_STATUSES.PROCESSED && 'info') ||
                  (status === FILE_STATUSES.INITIALIZED && 'warning') ||
                  'default'
                }
              >
                {status}
              </Label>
            </Stack>
            <Typography variant="subtitle1">{document.filename}</Typography>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <DocumentDetails document={document} fileFormat={fileFormat} />
          </Stack>
        </Card>
        <Card sx={{ width: '65%', maxHeight: '1400px', overflow: 'auto', p: 2 }}>
          <DocumentPreview previewUrls={previews} />
        </Card>
      </Stack>
    </Paper>
  )
}
