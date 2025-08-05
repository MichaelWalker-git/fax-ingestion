import { Stack, Typography } from '@mui/material'
import CustomNodeDocumentItem from '../../../common/components/custom-node/CustomNodeDocumentItem.tsx'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'

interface QuestionAnsweringConfigurationProps {
  nodeId: string
  itemAdditionText?: string
}

export default function QuestionAnsweringConfiguration({
  nodeId,
  itemAdditionText,
}: QuestionAnsweringConfigurationProps) {
  const { getParentInputNode } = useProcessingFlow()
  const parentInputNode = getParentInputNode(nodeId)

  return (
    <Stack gap={2.5} pt={1}>
      <Typography variant="caption" color="text.secondary">
        Ask a question about the document, and the system will extract the best answer
      </Typography>
      <Stack gap={1}>
        {parentInputNode?.processingFiles?.map((file) => (
          <CustomNodeDocumentItem key={file.name} name={file.name} additionText={itemAdditionText} />
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        To add and fill questions to documents, open the card in full-screen mode
      </Typography>
    </Stack>
  )
}
