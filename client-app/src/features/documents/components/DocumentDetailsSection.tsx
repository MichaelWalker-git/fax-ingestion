import { Box, Paper, Stack, Typography } from '@mui/material'
import { IDocumentType } from '../../../types/DocumentType.ts'

interface DocumentDetailsSectionProps {
  document: IDocumentType
}

export default function DocumentDetailsSection({ document }: DocumentDetailsSectionProps) {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Stack direction="row" spacing={4}>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              File name
            </Typography>
            <Typography variant="body1">{document.filename}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">{new Date(document.createdAt)?.toDateString()}</Typography>
          </Box>
        </Stack>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Typography variant="body1">{document.status}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Processing Type
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {document.processingType}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  )
}
