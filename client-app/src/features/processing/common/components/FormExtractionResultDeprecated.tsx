import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import AccuracyComponent from './AccuracyComponent.tsx'
import ProcessingResultJson from '../../../documents/components/ProcessingResultJson.tsx'

interface FormExtractionResultProps {
  result: { fields: FormField[] }
  viewMode?: string
}

export interface FormField {
  fieldName: string
  fieldNumber: string
  fieldValue: string
  accuracy: string
}

const CODE_MODE = 'code'
const COMPONENTS_MODE = 'components'

export default function FormExtractionResultDeprecated({ result, viewMode }: FormExtractionResultProps) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {CODE_MODE === viewMode && <ProcessingResultJson result={result as unknown as string} />}
      {COMPONENTS_MODE === viewMode && (
        <Box>
          {result.fields.map((field) => (
            <Box
              key={field.fieldName}
              display="flex"
              border="1px solid #ccc"
              justifyContent="space-between"
              borderRadius={1}
              p={2}
              mb={2}
              gap={0.8}
            >
              <Box display="flex" flexDirection="column">
                <Typography variant="h6">
                  {field.fieldName} {field.fieldNumber && `[${field.fieldNumber}]`}
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="body1">{field.fieldValue}</Typography>{' '}
                  <Tooltip title="Copy text">
                    <IconButton onClick={() => navigator.clipboard.writeText(field.fieldValue)} size="small">
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              {field.accuracy && <AccuracyComponent accuracy={field.accuracy} />}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
