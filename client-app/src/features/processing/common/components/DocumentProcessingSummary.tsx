import BallotOutlinedIcon from '@mui/icons-material/BallotOutlined'
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined'
import DownloadIcon from '@mui/icons-material/Download'
import {
  Alert,
  Box,
  CircularProgress,
  IconButton as MuiIconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { PROCESSING_MODES, PROCESSING_TYPES } from '../../../../shared/constants/processing-constants.ts'
import useProcessingResult from '../hooks/useProcessingResult.ts'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import { Table } from '../../../../types/Table.ts'
import AccuracyComponent from './AccuracyComponent.tsx'
import ProcessingResultText from '../../../documents/components/ProcessingResultText.tsx'
import TableExtractionResult from '../../tab/components/processing-result/TableExtractionResult.tsx'
import FormExtractionResultDeprecated, { FormField } from './FormExtractionResultDeprecated.tsx'
import TextExtractionResult from '../../tab/components/processing-result/TextExtractionResult.tsx'

interface DocumentProcessingSummaryProps {
  processingDocument: IDocumentType
  parentDocument: IDocumentType
  mode?: string
}

const CODE_MODE = 'code'
const COMPONENTS_MODE = 'components'

export default function DocumentProcessingSummary({
  processingDocument,
  mode,
  parentDocument,
}: DocumentProcessingSummaryProps) {
  const tab = processingDocument.tab

  const [formExtractionViewMode, setFormExtractionViewMode] = useState(COMPONENTS_MODE)

  const { parsedFileResult, downloadFile, parsingError, loading, result, presignedUrl } = useProcessingResult({
    processingDocument,
    mode,
  })

  const shouldDisplayDownloadButton =
    tab === PROCESSING_MODES.QA ? processingDocument.resultS3Path : processingDocument.promptResult!

  const accuracy = tab === PROCESSING_MODES.QA ? processingDocument.promptResult?.accuracy : parsedFileResult?.accuracy

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" gap={1} justifyContent="center" alignItems="center">
          {accuracy && <AccuracyComponent accuracy={accuracy} />}
          {parentDocument?.processingType === PROCESSING_TYPES.FORM && tab === PROCESSING_MODES.FORM && (
            <Stack direction="row" spacing={4} justifyContent="end">
              <ToggleButtonGroup
                value={formExtractionViewMode}
                exclusive
                onChange={(_, value) => value && setFormExtractionViewMode(value)}
                aria-label="result mode"
                size="small"
                sx={{ height: '32px' }}
              >
                <ToggleButton value={COMPONENTS_MODE} aria-label="left aligned">
                  <BallotOutlinedIcon />
                </ToggleButton>
                <ToggleButton value={CODE_MODE} aria-label="centered">
                  <DataObjectOutlinedIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          )}
          {shouldDisplayDownloadButton && (
            <Tooltip title="Download">
              <MuiIconButton onClick={downloadFile} color="primary" size="large">
                <DownloadIcon />
              </MuiIconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <Box>
        {tab === PROCESSING_MODES.FORM && (
          <>
            {parsingError && <Alert severity="error">Something went wrong</Alert>}
            {parentDocument?.processingType === PROCESSING_TYPES.FORM &&
              (loading ? (
                <Box display="flex" justifyContent="center" mt={10}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {result && presignedUrl && parsedFileResult ? (
                    <FormExtractionResultDeprecated
                      result={parsedFileResult.result as unknown as { fields: FormField[] }}
                      viewMode={formExtractionViewMode}
                    />
                  ) : (
                    'There is no result'
                  )}
                </>
              ))}
          </>
        )}
        {tab === PROCESSING_MODES.TEXT &&
          (result && presignedUrl ? (
            <TextExtractionResult text={parsedFileResult?.result as string} />
          ) : (
            <Typography>'There is no result'</Typography>
          ))}
        {tab === PROCESSING_MODES.TABLE &&
          (loading ? (
            <Box display="flex" justifyContent="center" mt={10}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {result && presignedUrl ? (
                <TableExtractionResult result={parsedFileResult?.result as Table[]} />
              ) : (
                'There is no result'
              )}
            </>
          ))}

        {tab === PROCESSING_MODES.QA &&
          (parsingError ? (
            <Alert severity="error">Something went wrong</Alert>
          ) : (
            <ProcessingResultText text={processingDocument?.promptResult?.result as string} />
          ))}
      </Box>
    </>
  )
}
