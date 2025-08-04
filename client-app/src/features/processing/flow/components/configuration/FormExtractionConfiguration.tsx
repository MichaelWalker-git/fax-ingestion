import { Stack, Typography } from '@mui/material'
import CustomNodeDocumentItem from '../../../common/components/custom-node/CustomNodeDocumentItem.tsx'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'

interface FormExtractionConfigurationProps {
  nodeId: string
  itemAdditionalText?: string
}

export default function FormExtractionConfiguration({ nodeId, itemAdditionalText }: FormExtractionConfigurationProps) {
  const { getParentInputNode } = useProcessingFlow()
  const parentInputNode = getParentInputNode(nodeId)

  return (
    <Stack gap={2.5} pt={1}>
      <Typography variant="caption" color="text.secondary">
        To improve accuracy, specify the data type and order number
      </Typography>
      <Stack gap={1}>
        {parentInputNode?.processingFiles?.map((file) => (
          <CustomNodeDocumentItem key={file.name} name={file.name} additionText={itemAdditionalText} />
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        To add and fill fields to documents, open the card in full-screen mode
      </Typography>
    </Stack>
  )
}
