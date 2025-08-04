import { Button, Modal, Paper, Stack, Typography, useTheme } from '@mui/material'
import { useState } from 'react'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import DocumentPrompt from '../../../common/components/prompt/DocumentPrompt.tsx'

interface QuestionAnsweringConfigurationModalProps {
  open: boolean
  onClose: () => void
  nodeId: string
}

export default function QuestionAnsweringConfigurationModal({
  open,
  onClose,
  nodeId,
}: QuestionAnsweringConfigurationModalProps) {
  const theme = useTheme()

  const { getParentInputNode } = useProcessingFlow()
  const parentInputNode = getParentInputNode(nodeId)

  const { putCustomNode, getCustomNode } = useProcessingFlow()

  const customNode = getCustomNode(nodeId)

  const [prompt, setPrompt] = useState<string>(customNode?.prompt || '')

  if (!customNode) {
    return null
  }

  const handleSave = () => {
    putCustomNode({
      ...customNode,
      prompt,
    })
    onClose()
  }

  const filenames = [...(parentInputNode?.processingFiles?.map((file) => file.name) || [])]

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper>
        <Stack sx={{ maxHeight: '90vh', width: '50vw', p: 2.5 }}>
          <Typography variant="h6" mb={2.5}>
            Question setup
          </Typography>
          <Stack gap={2}>
            <Typography variant="caption">
              Ask a question about the document, and the system will extract the best answer
            </Typography>
            <Stack gap={1} sx={{ p: 1, border: `dashed 1px ${theme.palette.divider}`, borderRadius: 1 }}>
              {filenames.map((filename) => (
                <Typography key={filename}>{filename}</Typography>
              ))}
            </Stack>
            <DocumentPrompt rows={3} prompt={prompt} setPrompt={setPrompt} />
          </Stack>
          <Stack py={4} alignItems="end">
            <Stack direction="row" gap={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  )
}
