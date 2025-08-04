import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Alert, Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import AccuracyComponent from '../../../common/components/AccuracyComponent.tsx'
import { MapFormProcessingResult, SimpleFormProcessingResult } from '../../../../../types/ProcessingResults.ts'
import { FormField } from '../../../../../types/DocumentProcessing.ts'
import { isMapProcessingResultArray } from './helpers.tsx'

interface FormExtractionResultProps {
  result?: SimpleFormProcessingResult | MapFormProcessingResult[]
  viewMode?: string
  loading?: boolean
}

export default function FormExtractionResult({ result, loading }: FormExtractionResultProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    )
  }

  let fields: FormField[] | undefined

  if (isMapProcessingResultArray(result)) {
    fields = (result as MapFormProcessingResult[]).flatMap((item) => item.result.fields)
  } else {
    fields = (result as SimpleFormProcessingResult)?.result.fields
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Stack direction="row" p={1}>
        <Typography variant="subtitle2" flex={1}>
          Field Name
        </Typography>
        <Typography variant="subtitle2" flex={1}>
          Extracted Value
        </Typography>
        <Typography variant="subtitle2" flex={1}>
          Accuracy
        </Typography>
      </Stack>
      <Stack gap={2}>
        {fields?.map((field) => (
          <Stack
            key={field.fieldName}
            direction="row"
            sx={{
              border: '1px dashed #ccc',
              borderRadius: 1,
              p: 2,
            }}
          >
            <Typography variant="body2" flex={1}>
              {field.fieldName} {field.fieldNumber && `[${field.fieldNumber}]`}
            </Typography>
            <Box display="flex" alignItems="center" flex={1}>
              <Typography variant="body2">
                {typeof field.fieldValue === 'string' ? field.fieldValue : JSON.stringify(field.fieldValue)}
              </Typography>{' '}
              <Tooltip title="Copy text">
                <IconButton onClick={() => navigator.clipboard.writeText(field.fieldValue)} size="small">
                  <ContentCopyIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box flex={1}>{field.accuracy && <AccuracyComponent accuracy={field.accuracy} />}</Box>
          </Stack>
        ))}
        {!fields && <Alert severity="warning">No form fields found</Alert>}
      </Stack>
    </Box>
  )
}
