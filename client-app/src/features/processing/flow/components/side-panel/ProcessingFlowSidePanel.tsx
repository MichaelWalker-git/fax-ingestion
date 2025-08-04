import { Paper } from '@mui/material'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import { PROCESSING_FLOW_SIDEPANEL_WIDTH } from '../../../../../styles/constants.ts'
import ProcessingFlowResults from './ProcessingFlowResults.tsx'
import ProcessingServices from './ProcessingServices.tsx'

export function ProcessingFlowSidePanel() {
  const { processingResults, isRunning, emailTriggerResults } = useProcessingFlow()

  return (
    <Paper
      sx={{
        width: PROCESSING_FLOW_SIDEPANEL_WIDTH,
        height: 'calc(100vh - 40px)',
        top: '20px',
        right: '20px',
        position: 'absolute',
        backgroundColor: 'background.secondary',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      {!!processingResults || !!emailTriggerResults || isRunning ? (
        <ProcessingFlowResults
          processingResults={processingResults}
          emailTriggerResults={emailTriggerResults}
          isRunning={isRunning}
        />
      ) : (
        <ProcessingServices />
      )}
    </Paper>
  )
}
