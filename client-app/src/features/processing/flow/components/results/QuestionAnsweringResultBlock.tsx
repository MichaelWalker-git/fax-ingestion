import useProcessingResult from '../../../common/hooks/useProcessingResult.ts'
import { Alert, IconButton, Stack, Typography } from '@mui/material'
import { PROCESSING_MODES } from '../../../../../shared/constants/processing-constants.ts'
import CircularLoader from '../../../../../shared/components/loader/CircularLoader.tsx'
import Iconify from '../../../../../shared/components/iconify'
import { useState } from 'react'
import AccuracyComponent from '../../../common/components/AccuracyComponent.tsx'
import { useGridApiRef } from '@mui/x-data-grid'
import QuestionAnsweringResult from '../../../tab/components/processing-result/QuestionAnsweringResult.tsx'
import { MapQAProcessingResult, ProcessingResult } from '../../../../../types/ProcessingResults.ts'

interface QuestionAnsweringResultBlockProps {
  processingDocument: ProcessingResult
  presignedUrl?: string
}

export default function QuestionAnsweringResultBlock({
  processingDocument,
  presignedUrl,
}: QuestionAnsweringResultBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const gridRef = useGridApiRef()

  const { parsedFileResult, parsingError, loading } = useProcessingResult({
    processingDocument,
    mode: PROCESSING_MODES.TEXT,
    gridRef,
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

          <QuestionAnsweringResult
            result={parsedFileResult as unknown as MapQAProcessingResult | MapQAProcessingResult[]}
          />
        </>
      )}
    </Stack>
  )
}
