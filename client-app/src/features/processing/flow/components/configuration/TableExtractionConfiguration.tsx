import { Stack, Typography } from '@mui/material'
import CustomNodeDocumentItem from '../../../common/components/custom-node/CustomNodeDocumentItem.tsx'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'

interface TableExtractionConfigurationProps {
  nodeId: string
  itemAdditionText?: string
}

export default function TableExtractionConfiguration({ nodeId, itemAdditionText }: TableExtractionConfigurationProps) {
  const { getParentInputNode } = useProcessingFlow()
  const parentInputNode = getParentInputNode(nodeId)

  return (
    <Stack gap={2.5} pt={1}>
      <Typography variant="caption" color="text.secondary">
        Set column names and data types for accurate extraction
      </Typography>
      <Stack gap={1}>
        {parentInputNode?.processingFiles?.map((file) => (
          <CustomNodeDocumentItem key={file.name} name={file.name} additionText={itemAdditionText} />
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        To add and fill columns to documents, open the card in full-screen mode
      </Typography>
    </Stack>
  )
}
