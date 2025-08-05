import { Stack } from '@mui/material'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import CustomNodeContainer from './CustomNodeContainer.tsx'
import CustomNodeHeader from '../../../common/components/custom-node/CustomNodeHeader.tsx'
import { useMemo, useState } from 'react'
import { handleProcessingResults } from '../../helpers/processing-results.ts'
import NodeResult from '../results/NodeResult.tsx'
import QuestionAnsweringConfiguration from '../configuration/QuestionAnsweringConfiguration.tsx'
import QuestionAnsweringConfigurationModal from '../configuration/QuestionAnsweringConfigurationModal.tsx'
import QuestionAnsweringResultModal from '../results/QuestionAnsweringResultModal.tsx'
import { ProcessingResult } from '../../../../../types/ProcessingResults.ts'

export default function QuestionAnsweringNode(props: NodeProps) {
  const [configurationModalOpen, setConfigurationModalOpen] = useState(false)
  const [resultsPreviewOpen, setResultsPreviewOpen] = useState(false)

  const { id } = props
  const { getCustomNode, processingResults, emailTriggerResults } = useProcessingFlow()

  const customNode = getCustomNode(id)

  const { processingDocumentResults, isAllProcessed, isInProgress } = useMemo(() => {
    return handleProcessingResults(customNode, processingResults)
  }, [customNode, processingResults])

  const emailTriggerAttachments = useMemo(() => {
    return emailTriggerResults?.flatMap((result) => result.attachments).filter((attachment) => !!attachment)
  }, [emailTriggerResults])

  const results = (processingDocumentResults || emailTriggerAttachments) as ProcessingResult[]

  if (!customNode) {
    return null
  }

  return (
    <CustomNodeContainer nodeProps={props} error={!!customNode.validationError}>
      <Stack gap={2}>
        <CustomNodeHeader
          nodeId={props.id}
          onOpen={() => {
            if (!results) {
              setConfigurationModalOpen(true)
            } else if (isAllProcessed || emailTriggerAttachments) {
              setResultsPreviewOpen(true)
            }
          }}
          loading={isInProgress}
          showCheckIcon={isAllProcessed}
        >
          Question Setup
        </CustomNodeHeader>
        {!customNode.isCollapsed &&
          (results ? <NodeResult processingResults={results} /> : <QuestionAnsweringConfiguration nodeId={id} />)}
      </Stack>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      {configurationModalOpen && (
        <QuestionAnsweringConfigurationModal
          open={configurationModalOpen}
          nodeId={id}
          onClose={() => setConfigurationModalOpen(false)}
        />
      )}
      {resultsPreviewOpen && results && (
        <QuestionAnsweringResultModal
          processingDocumentResults={results}
          onClose={() => setResultsPreviewOpen(false)}
          open={resultsPreviewOpen}
        />
      )}
    </CustomNodeContainer>
  )
}
