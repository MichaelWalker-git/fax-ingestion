import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { API_PATH_FILES } from '../../../shared/api/paths.ts'
import DocumentDetailsSection from '../components/DocumentDetailsSection.tsx'
import ProcessingResultsSection from '../components/ProcessingResultsSection.tsx'
import { IDocumentType } from '../../../types/DocumentType.ts'
import { getDocument } from '../../../shared/api/actions/document.ts'

export default function DocumentDetails() {
  const { id } = useParams()
  const { isLoading, error, data } = useQuery<IDocumentType>(`${API_PATH_FILES}/${id}`, () => getDocument(id!))

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        sx={{ mb: '16px', pb: '12px', borderBottom: '1px solid #ccc' }}
      >
        Document Details
      </Typography>
      {isLoading && (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress />
        </Box>
      )}
      {!!error && (
        <Alert sx={{ width: '100%', display: 'flex', justifyContent: 'center' }} severity="error">
          {(error as Error)?.message || 'Something went wrong'}
        </Alert>
      )}
      {!isLoading && !error && (
        <>
          <DocumentDetailsSection document={data!} />
          <ProcessingResultsSection document={data!} />
        </>
      )}
    </Box>
  )
}
