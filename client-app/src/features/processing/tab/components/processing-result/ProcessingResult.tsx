import useProcessingResult from '../../../common/hooks/useProcessingResult.ts'
import { IDocumentType } from '../../../../../types/DocumentType.ts'
import TextExtractionResult from './TextExtractionResult.tsx'
import { PROCESSING_MODES } from '../../../../../shared/constants/processing-constants.ts'
import AccuracyComponent from '../../../common/components/AccuracyComponent.tsx'
import Iconify from '../../../../../shared/components/iconify'
import { Alert, Button, Stack } from '@mui/material'
import FormExtractionResult from './FormExtractionResult.tsx'
import { Table } from '../../../../../types/Table.ts'
import TableExtractionResult from './TableExtractionResult.tsx'
import { useGridApiRef } from '@mui/x-data-grid'
import {
  MapFormProcessingResult,
  MapQAProcessingResult,
  SimpleFormProcessingResult,
} from '../../../../../types/ProcessingResults.ts'
import QuestionAnsweringResult from './QuestionAnsweringResult.tsx'

interface ProcessingResultProps {
  processingDocument: IDocumentType
  mode?: string
}

export default function ProcessingResult({ processingDocument, mode }: ProcessingResultProps) {
  const gridRef = useGridApiRef()
  const { parsedFileResult, downloadFile, parsingError, loading } = useProcessingResult({
    processingDocument,
    mode,
    gridRef,
  })

  const accuracy = mode === PROCESSING_MODES.QA ? processingDocument.promptResult?.accuracy : parsedFileResult?.accuracy

  if (parsingError) {
    return <Alert severity="error">Something went wrong</Alert>
  }

  return (
    <Stack gap={2.5}>
      <Stack alignItems="flex-end">
        <Button startIcon={<Iconify icon="ic:baseline-file-download" />} onClick={downloadFile}>
          Export
        </Button>
      </Stack>
      {accuracy !== undefined && <AccuracyComponent text="Extraction Accuracy: " accuracy={accuracy} />}
      {mode === PROCESSING_MODES.TEXT && (
        <TextExtractionResult
          text={parsedFileResult?.result || (parsedFileResult as string | object)}
          loading={loading}
        />
      )}
      {mode === PROCESSING_MODES.FORM && (
        <FormExtractionResult
          result={parsedFileResult as unknown as SimpleFormProcessingResult | MapFormProcessingResult[]}
          loading={loading}
        />
      )}
      {mode === PROCESSING_MODES.TABLE && (
        <TableExtractionResult
          result={parsedFileResult?.result as Table[]}
          gridRef={gridRef}
          loading={loading}
          height={'calc(100vh - 300px)'}
        />
      )}
      {mode === PROCESSING_MODES.QA && (
        <QuestionAnsweringResult
          result={parsedFileResult as unknown as MapQAProcessingResult | MapQAProcessingResult[]}
        />
      )}
    </Stack>
  )
}
