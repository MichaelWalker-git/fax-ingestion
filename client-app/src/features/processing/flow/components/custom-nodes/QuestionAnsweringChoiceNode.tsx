import { Box, Stack, Typography } from '@mui/material'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import DocumentPrompt from '../../../common/components/prompt/DocumentPrompt.tsx'
import CustomNodeContainer from './CustomNodeContainer.tsx'
import CustomNodeHeader from '../../../common/components/custom-node/CustomNodeHeader.tsx'
import CustomNodeDocumentItem from '../../../common/components/custom-node/CustomNodeDocumentItem.tsx'

export const CHOICES = {
  YES: 'yes',
  NO: 'no',
}

export type CHOICE_ANSWER_TYPE = (typeof CHOICES)[keyof typeof CHOICES]

export default function QuestionAnsweringChoiceNode(props: NodeProps) {
  const { id } = props
  const { putCustomNode, getCustomNode, getParentInputNode } = useProcessingFlow()

  const customNode = getCustomNode(id)

  const parentInputNode = getParentInputNode(id)

  if (!customNode) {
    return null
  }

  const handlePromptChange = (prompt: string) => {
    putCustomNode({
      ...customNode,
      prompt,
      validationError: undefined,
    })
  }

  return (
    <CustomNodeContainer nodeProps={props} error={!!customNode.validationError}>
      <Stack gap={2}>
        <CustomNodeHeader nodeId={props.id}>Question Answering Choice</CustomNodeHeader>
        {!customNode?.isCollapsed && (
          <>
            <Typography variant="caption" color="text.secondary">
              Enter a question
            </Typography>
            <Stack gap={1}>
              {parentInputNode?.processingFiles?.map((file) => (
                <CustomNodeDocumentItem key={file.name} name={file.name} />
              ))}
            </Stack>
            <DocumentPrompt
              prompt={customNode.prompt}
              setPrompt={handlePromptChange}
              rows={3}
              error={customNode.validationError}
            />
          </>
        )}
        <Box display="flex" justifyContent="space-between" px={4}>
          <Typography variant="subtitle2"> Yes </Typography> <Typography variant="subtitle2">No</Typography>
        </Box>
      </Stack>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id={CHOICES.YES} style={{ left: '20%' }} />
      <Handle type="source" position={Position.Bottom} id={CHOICES.NO} style={{ left: '80%' }} />
    </CustomNodeContainer>
  )
}
