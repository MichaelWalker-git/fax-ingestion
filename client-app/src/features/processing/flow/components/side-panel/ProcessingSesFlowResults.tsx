import { Stack, Typography } from '@mui/material'
import SesResultItem from './SesResultItem.tsx'
import { EmailTriggerResult } from '../../../../../types/EmailTrigger.ts'
import CircularLoader from '../../../../../shared/components/loader/CircularLoader.tsx'

interface ProcessingSesFlowResults {
  emailTriggerResults: EmailTriggerResult[]
  isRunning: boolean
}

export default function ProcessingSesFlowResults({ emailTriggerResults, isRunning }: ProcessingSesFlowResults) {
  const processedResults = emailTriggerResults.filter((result) => result.status === 'processed')

  return (
    <>
      <Stack gap={1}>
        {processedResults?.length > 0 && (
          <Typography variant="subtitle2" color="primary">
            {processedResults.length} emails have been processed
          </Typography>
        )}
        {emailTriggerResults.map((result) => (
          <SesResultItem key={result.sortKey} resultItem={result} />
        ))}
      </Stack>
      {isRunning && <CircularLoader text="Waiting for email to arrive..." />}
    </>
  )
}
