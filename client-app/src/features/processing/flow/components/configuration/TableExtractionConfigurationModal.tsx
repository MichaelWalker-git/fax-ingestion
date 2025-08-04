import { Button, Modal, Paper, Stack, Typography } from '@mui/material'
import { ITableSchema } from '../../../../../types/Scema.ts'
import { useState } from 'react'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import TableExtractionSchemaForm from './TableExtractionSchemaForm.tsx'
import { Column } from '../../../../../types/Table.ts'

interface FormExtractionConfigurationModalProps {
  open: boolean
  onClose: () => void
  nodeId: string
}

export default function TableExtractionConfigurationModal({
  open,
  onClose,
  nodeId,
}: FormExtractionConfigurationModalProps) {
  const { getParentInputNode } = useProcessingFlow()
  const parentInputNode = getParentInputNode(nodeId)

  const { putCustomNode, getCustomNode } = useProcessingFlow()

  const customNode = getCustomNode(nodeId)

  const [schema, setSchema] = useState<ITableSchema>((customNode?.schema as ITableSchema) || [])

  if (!customNode) {
    return null
  }

  const handleFieldChange = (schema: Column[]) => {
    setSchema(schema)
  }

  const handleSave = () => {
    putCustomNode({
      ...customNode,
      schema,
    })
    onClose()
  }

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
            Column configuration
          </Typography>
          <TableExtractionSchemaForm
            columns={schema}
            setColumns={handleFieldChange}
            filenames={[...(parentInputNode?.processingFiles?.map((file) => file.name) || [])]}
          />
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
