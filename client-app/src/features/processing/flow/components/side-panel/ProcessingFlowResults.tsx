import { Alert, Stack, Typography } from '@mui/material'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import { IDocumentType } from '../../../../../types/DocumentType.ts'
import ProcessingSimpleFlowResults from './ProcessingSimpleFlowResults.tsx'
import { EmailTriggerResult } from '../../../../../types/EmailTrigger.ts'
import ProcessingSesFlowResults from './ProcessingSesFlowResults.tsx'
import CircularLoader from '../../../../../shared/components/loader/CircularLoader.tsx'

interface ProcessingFlowResultsProps {
  processingResults?: IDocumentType[]
  emailTriggerResults?: EmailTriggerResult[]
  isRunning: boolean
}

export default function ProcessingFlowResults({
  processingResults,
  isRunning,
  emailTriggerResults,
}: ProcessingFlowResultsProps) {
  const { error } = useProcessingFlow()

  return (
    <Stack gap={2}>
      <Stack gap={1}>
        <Typography variant="subtitle2">Extracted Data</Typography>
        <Typography variant="caption" color="textDisabled">
          Verify the extracted data, make adjustments if needed, and download the results.
        </Typography>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {isRunning && !processingResults && <CircularLoader text="Processing your document..." />}
      {processingResults && <ProcessingSimpleFlowResults processingResults={processingResults} isRunning={isRunning} />}
      {emailTriggerResults && (
        <ProcessingSesFlowResults emailTriggerResults={emailTriggerResults} isRunning={isRunning} />
      )}
    </Stack>
  )
}
