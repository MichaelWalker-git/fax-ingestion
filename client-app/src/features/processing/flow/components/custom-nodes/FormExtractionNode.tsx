import { Handle, NodeProps, Position } from '@xyflow/react'
import { useMemo, useState } from 'react'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import CustomNodeContainer from './CustomNodeContainer.tsx'
import CustomNodeHeader from '../../../common/components/custom-node/CustomNodeHeader.tsx'
import FormExtractionConfiguration from '../configuration/FormExtractionConfiguration.tsx'
import FormExtractionConfigurationModal from '../configuration/FormExtractionConfigurationModal.tsx'
import NodeResult from '../results/NodeResult.tsx'
import { handleProcessingResults } from '../../helpers/processing-results.ts'
import FormExtractionResultModal from '../results/FormExtractionResultModal.tsx'
import { IFormSchema } from '../../../../../types/Scema.ts'
import { ProcessingResult } from '../../../../../types/ProcessingResults.ts'

export default function FormExtractionNode(props: NodeProps) {
  const [configurationModalOpen, setConfigurationModalOpen] = useState(false)
  const [resultsPreviewOpen, setResultsPreviewOpen] = useState(false)

  const { id } = props
  const { getCustomNode, processingResults, emailTriggerResults } = useProcessingFlow()

  const customNode = getCustomNode(id)

  const { processingDocumentResults, isAllProcessed, isInProgress } = useMemo(() => {
    return handleProcessingResults(customNode, processingResults)
  }, [customNode, processingResults])

  const columnsCount = (customNode?.schema as IFormSchema)?.fields?.length
  const itemAdditionalText = columnsCount ? `${columnsCount} field${columnsCount > 1 ? 's' : ''}` : undefined

  const emailTriggerAttachments = useMemo(() => {
    return emailTriggerResults?.flatMap((result) => result.attachments).filter((attachment) => !!attachment)
  }, [emailTriggerResults])

  const results = (processingDocumentResults || emailTriggerAttachments) as ProcessingResult[]

  if (!customNode) {
    return null
  }

  return (
    <CustomNodeContainer nodeProps={props}>
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
        Configure fields
      </CustomNodeHeader>
      {!customNode.isCollapsed &&
        (results ? (
          <NodeResult itemAdditionText={itemAdditionalText} processingResults={results} />
        ) : (
          <FormExtractionConfiguration itemAdditionalText={itemAdditionalText} nodeId={id} />
        ))}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      {configurationModalOpen && (
        <FormExtractionConfigurationModal
          open={configurationModalOpen}
          nodeId={id}
          onClose={() => setConfigurationModalOpen(false)}
        />
      )}
      {resultsPreviewOpen && results && (
        <FormExtractionResultModal
          open={resultsPreviewOpen}
          onClose={() => setResultsPreviewOpen(false)}
          processingDocumentResults={results}
        />
      )}
    </CustomNodeContainer>
  )
}
