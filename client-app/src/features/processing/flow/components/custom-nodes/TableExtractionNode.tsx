import { Handle, NodeProps, Position } from '@xyflow/react'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import CustomNodeContainer from './CustomNodeContainer.tsx'
import CustomNodeHeader from '../../../common/components/custom-node/CustomNodeHeader.tsx'
import { useMemo, useState } from 'react'
import { handleProcessingResults } from '../../helpers/processing-results.ts'
import TableExtractionConfiguration from '../configuration/TableExtractionConfiguration.tsx'
import TableExtractionConfigurationModal from '../configuration/TableExtractionConfigurationModal.tsx'
import NodeResult from '../results/NodeResult.tsx'
import TableExtractionResultModal from '../results/TableExtractionResultModal.tsx'
import { ITableSchema } from '../../../../../types/Scema.ts'
import { ProcessingResult } from '../../../../../types/ProcessingResults.ts'

export default function TableExtractionNode(props: NodeProps) {
  const [configurationModalOpen, setConfigurationModalOpen] = useState(false)
  const [resultsPreviewOpen, setResultsPreviewOpen] = useState(false)

  const { id } = props
  const { getCustomNode, processingResults, emailTriggerResults } = useProcessingFlow()

  const customNode = getCustomNode(id)

  const { processingDocumentResults, isAllProcessed, isInProgress } = useMemo(() => {
    return handleProcessingResults(customNode, processingResults)
  }, [customNode, processingResults])

  const columnsCount = (customNode?.schema as ITableSchema)?.length
  const itemAdditionalText = columnsCount ? `${columnsCount} column ${columnsCount > 1 ? 's' : ''}` : undefined

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
          } else if (isAllProcessed || results) {
            setResultsPreviewOpen(true)
          }
        }}
        loading={isInProgress}
        showCheckIcon={isAllProcessed}
      >
        Column Configuration
      </CustomNodeHeader>
      {!customNode.isCollapsed &&
        (processingDocumentResults ? (
          <NodeResult processingResults={results} itemAdditionText={itemAdditionalText} />
        ) : (
          <TableExtractionConfiguration nodeId={id} itemAdditionText={itemAdditionalText} />
        ))}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      {configurationModalOpen && (
        <TableExtractionConfigurationModal
          open={configurationModalOpen}
          nodeId={id}
          onClose={() => setConfigurationModalOpen(false)}
        />
      )}
      {resultsPreviewOpen && results && (
        <TableExtractionResultModal
          processingDocumentResults={results}
          open={resultsPreviewOpen}
          onClose={() => setResultsPreviewOpen(false)}
        />
      )}
    </CustomNodeContainer>
  )
}
