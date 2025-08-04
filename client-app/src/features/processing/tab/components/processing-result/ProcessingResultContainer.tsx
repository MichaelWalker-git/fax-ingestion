import { Alert, Card, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import ProcessingDocumentPreviewContainer from '../ProcessingDocumentPreviewContainer.tsx'
import { EXTRACTION_METHODS } from '../extraction/utils.ts'
import ExtractionOption from '../extraction/ExtractionOption.tsx'
import { use } from 'react'
import { ProcessingContext } from '../../context/ProcessingContext.tsx'
import usePolling from '../../../../../shared/hooks/usePolling.ts'
import { getDocument } from '../../../../../shared/api/actions/document.ts'
import { FILE_STATUSES } from '../../../../../shared/constants/file-constants.ts'
import ProcessingResult from './ProcessingResult.tsx'
import { getRagMultiFileResult } from '../../../../../shared/api/actions/processing.ts'

export default function ProcessingResultContainer() {
  const {
    processingDocument,
    setProcessingDocument,
    processingError,
    mode,
    isRunning,
    setIsRunning,
    parentDocument,
    selectAll,
    isProcessingStarting,
  } = use(ProcessingContext)

  const { loading, error: documentError } = usePolling({
    apiCall: async () => {
      if (!processingDocument) {
        return { status: FILE_STATUSES.IN_PROGRESS }
      }

      const isMultipage = parentDocument?.isHasChildren && !selectAll
      const responseDocument = isMultipage
        ? await getRagMultiFileResult(processingDocument?.sortKey)
        : await getDocument(processingDocument?.sortKey)

      if (responseDocument.status === 'Processed') {
        setIsRunning(false)
      }
      setProcessingDocument?.(responseDocument)
      return responseDocument
    },
    checkDone: (data) => data?.status === 'Processed',
    interval: 2000,
    skip: !!processingError || !isRunning || !processingDocument || isProcessingStarting,
  })

  const error = documentError || processingError

  return (
    <Paper
      sx={{
        p: 1,
        my: 3,
        minHeight: 120,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
      }}
    >
      <Stack direction="row" gap={1}>
        <Card sx={{ width: '50%', p: 2 }}>
          <ProcessingDocumentPreviewContainer />
        </Card>
        <Card sx={{ width: '50%', p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Stack gap={1}>
            <Typography variant="subtitle2">Extracted Data</Typography>
            <Typography variant="caption" color="textDisabled">
              Verify the extracted data, make adjustments if needed, and download the results.
            </Typography>
          </Stack>
          <Stack direction="row" gap={1} alignItems="flex-start" mt={1}>
            {EXTRACTION_METHODS.map((method) => (
              <ExtractionOption
                key={method.text}
                icon={method.icon}
                text={method.text}
                warning={method.warning}
                value={method.value}
                checked={mode === method.value}
                showCheckedIcon={mode === method.value && !isRunning}
              />
            ))}
          </Stack>
          {error && <Alert severity="error">{processingError || error}</Alert>}
          {(isRunning || loading) && (
            <Stack justifyContent="center" alignItems="center" gap={2} p={4}>
              <CircularProgress />
              <Stack>
                <Typography variant="caption">Processing your document...</Typography>
                <Typography variant="caption" color="textDisabled">
                  This may take a few seconds.
                </Typography>
              </Stack>
            </Stack>
          )}
          {!isRunning && !error && processingDocument?.status === FILE_STATUSES.PROCESSED && (
            <ProcessingResult processingDocument={processingDocument} mode={mode} />
          )}
        </Card>
      </Stack>
    </Paper>
  )
}
