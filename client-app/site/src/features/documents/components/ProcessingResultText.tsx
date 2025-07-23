import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Box, IconButton, Tooltip } from '@mui/material'

interface ProcessingResultTextProps {
  text?: string | object
}

export default function ProcessingResultText({ text }: ProcessingResultTextProps) {
  if (!text) {
    return null
  }

  const textString = typeof text === 'string' ? text : JSON.stringify(text)

  const handleCopy = () => {
    navigator.clipboard.writeText(textString!)
  }

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', p: 2, position: 'relative' }}>
      <code>{textString || 'There is no result'}</code>
      {textString && (
        <Tooltip title="Copy text" sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton onClick={handleCopy} size="small">
            <ContentCopyIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}
