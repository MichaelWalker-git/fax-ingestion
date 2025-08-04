import { alpha } from '@mui/material/styles'
import { Card, Paper, Stack, Typography } from '@mui/material'
import { use } from 'react'
import ExtractionOption from './ExtractionOption.tsx'
import { EXTRACTION_METHODS } from './utils.ts'
import { PROCESSING_MODES } from '../../../../../shared/constants/processing-constants.ts'
import TextExtraction from './TextExtraction.tsx'
import FormExtraction from './FormExtraction.tsx'
import TableExtraction from './TableExtraction.tsx'
import QuestionAnsweringExtraction from './QuestionAnsweringExtraction.tsx'
import ProcessingDocumentPreviewContainer from '../ProcessingDocumentPreviewContainer.tsx'
import { ProcessingContext } from '../../context/ProcessingContext.tsx'

export default function DataExtraction() {
  const { mode, setMode } = use(ProcessingContext)

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
            <Typography variant="subtitle2">Extraction method</Typography>
            <Typography variant="caption" color="textDisabled">
              Choose the extraction method that best suits your needs.{' '}
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
                onSelect={setMode}
                checked={mode === method.value}
                radio
              />
            ))}
          </Stack>
          {mode === PROCESSING_MODES.TEXT && <TextExtraction />}
          {mode === PROCESSING_MODES.FORM && <FormExtraction />}
          {mode === PROCESSING_MODES.TABLE && <TableExtraction />}
          {mode === PROCESSING_MODES.QA && <QuestionAnsweringExtraction />}
        </Card>
      </Stack>
    </Paper>
  )
}
