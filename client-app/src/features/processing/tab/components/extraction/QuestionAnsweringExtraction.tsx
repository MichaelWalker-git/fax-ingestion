import { Divider, Stack, Typography } from '@mui/material'
import DocumentPromptContainer from '../../../common/components/prompt/DocumentPromptContainer.tsx'

export default function QuestionAnsweringExtraction() {
  return (
    <Stack gap={3}>
      <Typography variant="caption">
        Choose Question Extraction to retrieve specific information from the document by asking direct questions.
      </Typography>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <Stack gap={1}>
        <Typography variant="subtitle2">Question Setup</Typography>
        <Typography variant="caption" color="textDisabled">
          Enter a question related to the document's content, and the system will find and extract the most relevant
          answer.
        </Typography>
      </Stack>
      <DocumentPromptContainer />
    </Stack>
  )
}
