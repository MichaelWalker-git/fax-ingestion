import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { MapQAProcessingResult } from '../../../../../types/ProcessingResults.ts'
import { isMapProcessingResultArray } from './helpers.tsx'
import AccuracyComponent from '../../../common/components/AccuracyComponent.tsx'

interface QuestionAnsweringResultProps {
  result?: MapQAProcessingResult | MapQAProcessingResult[]
}

export default function QuestionAnsweringResult({ result }: QuestionAnsweringResultProps) {
  if (!result) {
    return null
  }

  const handleCopy = (textString: string) => {
    navigator.clipboard.writeText(textString!)
  }
  const isMapProcessing = isMapProcessingResultArray(result)

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2, position: 'relative' }}>
      {!isMapProcessing && (
        <>
          <code>{(result as MapQAProcessingResult).result || 'There is no result'}</code>
          <Tooltip title="Copy text" sx={{ position: 'absolute', top: 8, right: 8 }}>
            <IconButton onClick={() => handleCopy((result as MapQAProcessingResult).result)} size="small">
              <ContentCopyIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </>
      )}
      {isMapProcessing && (
        <Stack gap={1}>
          {(result as MapQAProcessingResult[])?.map((item) => (
            <Stack key={item.page}>
              <Stack
                direction="row"
                gap={1}
                alignItems="center"
                justifyContent="space-between"
                p={2}
                sx={{ position: 'relative' }}
              >
                <Typography variant="subtitle2">Page: {item.page}</Typography>
                <AccuracyComponent text="Extraction accuracy:" accuracy={item?.accuracy} />
              </Stack>
              <code>{(item.result as string) || 'There is no result'}</code>
              <Tooltip title="Copy text" sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton onClick={() => handleCopy(item.result as string)} size="small">
                  <ContentCopyIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  )
}
