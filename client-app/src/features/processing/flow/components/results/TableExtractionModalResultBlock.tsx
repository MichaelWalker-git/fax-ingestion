import useProcessingResult from '../../../common/hooks/useProcessingResult.ts'
import { Alert, IconButton, Stack, Typography } from '@mui/material'
import { PROCESSING_MODES } from '../../../../../shared/constants/processing-constants.ts'
import Iconify from '../../../../../shared/components/iconify'
import { useState } from 'react'
import AccuracyComponent from '../../../common/components/AccuracyComponent.tsx'
import { Table } from '../../../../../types/Table.ts'
import TableExtractionResult from '../../../tab/components/processing-result/TableExtractionResult.tsx'
import { useGridApiRef } from '@mui/x-data-grid'
import { MapTableProcessingResult, ProcessingResult } from '../../../../../types/ProcessingResults.ts'

interface TableExtractionResultProps {
  processingDocument: ProcessingResult
  presignedUrl?: string
}

export default function TableExtractionModalResultBlock({
  processingDocument,
  presignedUrl,
}: TableExtractionResultProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const gridRef = useGridApiRef()

  const { parsedFileResult, parsingError, loading } = useProcessingResult({
    processingDocument,
    mode: PROCESSING_MODES.TEXT,
    gridRef,
    resultPresignedUrl: presignedUrl,
  })
  console.log('parsedFileResult', parsedFileResult)
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

          <TableExtractionResult
            result={parsedFileResult as unknown as Table[] | MapTableProcessingResult[]}
            gridRef={gridRef}
            loading={loading}
          />
        </>
      )}
    </Stack>
  )
}
