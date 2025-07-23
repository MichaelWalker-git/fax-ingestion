import { Stack } from '@mui/material'
import { Handle, NodeProps, Position } from '@xyflow/react'
import CustomNodeContainer from './CustomNodeContainer.tsx'
import CustomNodeHeader from '../../../common/components/custom-node/CustomNodeHeader.tsx'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import TextExtractionResultModal from '../results/TextExtractionResultModal.tsx'
import { useMemo, useState } from 'react'
import CustomNodeDocumentItem from '../../../common/components/custom-node/CustomNodeDocumentItem.tsx'
import { handleProcessingResults } from '../../helpers/processing-results.ts'
import TextExtractionConfiguration from '../configuration/TextExtractionConfiguration.tsx'
import { ProcessingResult } from '../../../../../types/ProcessingResults.ts'

export default function TextExtractionNode(props: NodeProps) {
  const { processingResults, getCustomNode, emailTriggerResults } = useProcessingFlow()

  const [resultsPreviewOpen, setResultsPreviewOpen] = useState(false)

  const currentNode = getCustomNode(props.id)

  const { processingDocumentResults, isAllProcessed, isInProgress } = useMemo(() => {
    return handleProcessingResults(currentNode, processingResults)
  }, [currentNode, processingResults])

  const emailTriggerAttachments = useMemo(() => {
    return emailTriggerResults?.flatMap((result) => result.attachments)
  }, [emailTriggerResults])

  const results = (processingDocumentResults || emailTriggerAttachments) as ProcessingResult[]

  return (
    <CustomNodeContainer nodeProps={props}>
      <CustomNodeHeader
        nodeId={props.id}
        loading={isInProgress}
        showCheckIcon={isAllProcessed}
        onOpen={isAllProcessed || emailTriggerResults ? () => setResultsPreviewOpen(true) : undefined}
      >
        Text Extraction Configuration
      </CustomNodeHeader>
      {!currentNode?.isCollapsed &&
        ((processingDocumentResults && processingDocumentResults.length > 0) || emailTriggerResults ? (
          <Stack gap={1}>
            {processingDocumentResults?.map((documentResult) => (
              <CustomNodeDocumentItem
                key={documentResult.sortKey}
                name={documentResult.filename}
                status={documentResult.status}
              />
            ))}
            {emailTriggerAttachments?.map((emailTriggerResult) => (
              <CustomNodeDocumentItem
                key={emailTriggerResult.fileId}
                name={emailTriggerResult.filename}
                status={emailTriggerResult.status}
              />
            ))}
          </Stack>
        ) : (
          <TextExtractionConfiguration nodeId={props.id} />
        ))}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      {resultsPreviewOpen && results && (
        <TextExtractionResultModal
          open={resultsPreviewOpen}
          handleClose={() => setResultsPreviewOpen(false)}
          processingDocumentResults={results}
        />
      )}
    </CustomNodeContainer>
  )
}
