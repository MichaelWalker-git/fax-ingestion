import { Box, CircularProgress } from '@mui/material'

import Zoom from 'react-medium-image-zoom'
import { useQuery } from 'react-query'
import { fetchDocumentPreview } from '../../../shared/api/actions/admin.ts'
import { IDocumentType } from '../../../types/DocumentType.ts'
import 'react-medium-image-zoom/dist/styles.css'

interface DocumentPreviewProps {
  document?: IDocumentType
}

export default function DocumentPreviewDeprecated({ document }: DocumentPreviewProps) {
  const { data: previewUrl, isLoading: loading } = useQuery(
    ['documents-preview', document?.sortKey],
    fetchDocumentPreview(document?.filename!, document?.s3Path!),
    { enabled: !!document, staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000 },
  )

  if (loading) {
    return (
      <Box>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Zoom>
        <img
          src={previewUrl}
          alt="document preview"
          style={{
            width: '600px',
            height: 'auto',
            maxHeight: 'calc(100vh - 300px)',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        />
      </Zoom>
    </Box>
  )
}
