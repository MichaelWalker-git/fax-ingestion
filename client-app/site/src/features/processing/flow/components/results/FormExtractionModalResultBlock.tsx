import useProcessingResult from '../../../common/hooks/useProcessingResult.ts'
import { Alert, IconButton, Stack, Typography } from '@mui/material'
import { PROCESSING_MODES } from '../../../../../shared/constants/processing-constants.ts'
import CircularLoader from '../../../../../shared/components/loader/CircularLoader.tsx'
import Iconify from '../../../../../shared/components/iconify'
import { useState } from 'react'
import AccuracyComponent from '../../../common/components/AccuracyComponent.tsx'
import FormExtractionResult from '../../../tab/components/processing-result/FormExtractionResult.tsx'
import {
  MapFormProcessingResult,
  ProcessingResult,
  SimpleFormProcessingResult,
} from '../../../../../types/ProcessingResults.ts'

interface TextExtractionResultProps {
  processingDocument: ProcessingResult
  presignedUrl?: string
}

export default function FormExtractionModalResultBlock({
  processingDocument,
  presignedUrl,
}: TextExtractionResultProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { parsedFileResult, parsingError, loading } = useProcessingResult({
    processingDocument,
    mode: PROCESSING_MODES.FORM,
    resultPresignedUrl: presignedUrl,
  })

  return (
    <Stack sx={{ p: 1, border: '1px dashed #ccc', borderRadius: '8px', gap: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap={1}>
          <Typography variant="body1">{processingDocument.filename}</Typography>
          <Iconify icon="ic:baseline-check" color="primary.main" />
        </Stack>
        <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
          <Iconify
            icon={isCollapsed ? 'ic:baseline-expand-more' : 'ic:baseline-expand-less'}
            sx={{ width: 20, height: 20 }}
            color="primary.main"
          />
        </IconButton>
      </Stack>
      {parsedFileResult?.accuracy && (
        <AccuracyComponent text="Extraction accuracy:" accuracy={parsedFileResult?.accuracy} />
      )}
      {!isCollapsed && (
        <>
          {parsingError && <Alert severity="error">Something went wrong</Alert>}
          {loading && <CircularLoader text="Loading results" />}

          <FormExtractionResult
            result={parsedFileResult as unknown as SimpleFormProcessingResult | MapFormProcessingResult[]}
            loading={loading}
          />
        </>
      )}
    </Stack>
  )
}
