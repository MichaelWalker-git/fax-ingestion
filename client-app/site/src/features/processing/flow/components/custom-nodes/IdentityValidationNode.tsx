import { Handle, NodeProps, Position } from '@xyflow/react'
import { useMemo, useState } from 'react'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import CustomNodeContainer from './CustomNodeContainer.tsx'
import CustomNodeHeader from '../../../common/components/custom-node/CustomNodeHeader.tsx'
import FormExtractionConfiguration from '../configuration/FormExtractionConfiguration.tsx'
import NodeResult from '../results/NodeResult.tsx'
import { handleProcessingResults } from '../../helpers/processing-results.ts'
import { IFormSchema } from '../../../../../types/Scema.ts'
import IdentityValidationResultsModal from '../results/IdentityValidationResultsModal.tsx'
import IdentityValidationConfigurationModal from '../configuration/IdentityValidationConfigurationModal.tsx'

export default function IdentityValidationNode(props: NodeProps) {
  const [configurationModalOpen, setConfigurationModalOpen] = useState(false)
  const [resultsPreviewOpen, setResultsPreviewOpen] = useState(false)

  const { id } = props
  const { getCustomNode, processingResults } = useProcessingFlow()

  const customNode = getCustomNode(id)

  const { processingDocumentResults, isAllProcessed, isInProgress } = useMemo(() => {
    return handleProcessingResults(customNode, processingResults)
  }, [customNode, processingResults])

  if (!customNode) {
    return null
  }

  const columnsCount = (customNode?.schema as IFormSchema)?.fields?.length
  const itemAdditionalText = columnsCount ? `${columnsCount} field${columnsCount > 1 ? 's' : ''}` : undefined

  return (
    <CustomNodeContainer nodeProps={props}>
      <CustomNodeHeader
        nodeId={props.id}
        onOpen={() => {
          if (!processingDocumentResults) {
            setConfigurationModalOpen(true)
          } else if (isAllProcessed) {
            setResultsPreviewOpen(true)
          }
        }}
        loading={isInProgress}
        showCheckIcon={isAllProcessed}
      >
        Configure validation fields
      </CustomNodeHeader>
      {!customNode.isCollapsed &&
        (processingDocumentResults ? (
          <NodeResult itemAdditionText={itemAdditionalText} processingResults={processingDocumentResults} />
        ) : (
          <FormExtractionConfiguration itemAdditionalText={itemAdditionalText} nodeId={id} />
        ))}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      {configurationModalOpen && (
        <IdentityValidationConfigurationModal
          open={configurationModalOpen}
          nodeId={id}
          onClose={() => setConfigurationModalOpen(false)}
        />
      )}
      {resultsPreviewOpen && processingDocumentResults && (
        <IdentityValidationResultsModal
          open={resultsPreviewOpen}
          onClose={() => setResultsPreviewOpen(false)}
          processingDocumentResults={processingDocumentResults}
        />
      )}
    </CustomNodeContainer>
  )
}
