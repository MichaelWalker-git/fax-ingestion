import { Box } from '@mui/material'
import JSONPretty from 'react-json-pretty'

interface ProcessingResultJsonProps {
  result: string
}

export default function ProcessingResultJson({ result }: ProcessingResultJsonProps) {
  return (
    <Box>
      <JSONPretty data={result} mainStyle="padding:1em;min-height:300px;margin:0;max-height:500px" />
    </Box>
  )
}
