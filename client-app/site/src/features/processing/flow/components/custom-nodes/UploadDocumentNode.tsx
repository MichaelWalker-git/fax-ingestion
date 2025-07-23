import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { use } from 'react'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import CustomNodeContainer from './CustomNodeContainer.tsx'
import FileLabel from '../../../../../shared/components/file-label/FileLabel.tsx'
import Iconify from '../../../../../shared/components/iconify'
import { useBoolean } from '../../../../../shared/hooks/useBoolean.ts'
import UploadFileModal from '../../../../../shared/components/UploadFileModal.tsx'
import { UploadedFile } from '../../../../../types/File.ts'
import { useMutation } from 'react-query'
import { deleteDocument } from '../../../../../shared/api/actions/document.ts'
import { SnackbarContext } from '../../../../../context/SnackbarContext.tsx'
import { useChildPages } from '../../hooks/useChildPages.ts'
import useSampleDocuments from '../../hooks/useSampleDocuments.ts'

export default function UploadDocumentNode(props: NodeProps) {
  const { id } = props
  const { putCustomNode, getCustomNode } = useProcessingFlow()
  const { setSnackbar } = use(SnackbarContext)

  const { mutate: deleteDocumentMutate } = useMutation(deleteDocument, {
    onSuccess: () => {
      setSnackbar({ text: 'Document deleted successfully', severity: 'success' })
    },
    onError: (error) => {
      console.error('Error deleting document:', error)
      setSnackbar({ text: 'Error deleting document:', severity: 'error' })
    },
  })

  const customNode = getCustomNode(id)

  const handleNewUploadedDocuments = (newUploadedDocuments: UploadedFile[]) => {
    if (customNode) {
      putCustomNode({
        ...customNode,
        processingFiles: newUploadedDocuments,
      })
      setNewUploadedDocuments(newUploadedDocuments.map((file) => file.fileId))
    }
  }

  const { isLoading: isSamplesLoading } = useSampleDocuments({
    customNode,
    handleNewUploadedDocuments,
  })

  const { setNewUploadedDocuments, isPolling: isChildrenLoading } = useChildPages({ customNode })

  const uploadModal = useBoolean()

  if (!customNode) {
    return null
  }

  const handleFileDelete = (fileId: string) => {
    putCustomNode({
      ...customNode,
      processingFiles: customNode.processingFiles?.filter((file) => file.fileId !== fileId),
      validationError: undefined,
    })
    deleteDocumentMutate(fileId)
  }

  return (
    <CustomNodeContainer nodeProps={props} key={customNode.id} error={!!customNode.validationError}>
      <Stack gap={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 0 }}>
            Upload Documents
          </Typography>
          <Button variant="contained" component="span" onClick={() => uploadModal.onTrue()}>
            Browse
          </Button>
        </Stack>
        {customNode?.additionalAttributes?.description && (
          <Typography variant="caption" color="text.secondary">
            {customNode?.additionalAttributes?.description}
          </Typography>
        )}
        <Stack>
          {isSamplesLoading && <CircularProgress color="inherit" size={16} />}
          {customNode.processingFiles?.map((file) => (
            <Stack key={file.fileId} direction="row" justifyContent="space-between" alignItems="center" gap={1}>
              <Stack direction="row" alignItems="center" gap={1}>
                <FileLabel filename={file.name} withoutText />
                <Typography variant="body2" color="text.primary">
                  {file.name}
                </Typography>
              </Stack>
              {isChildrenLoading && <CircularProgress color="inherit" size={16} />}
              {!isChildrenLoading && (
                <Iconify
                  icon="ic:delete"
                  color="text.secondary"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleFileDelete(file.fileId)}
                />
              )}
            </Stack>
          ))}
        </Stack>
        {customNode.validationError && <Alert severity="error">{customNode.validationError}</Alert>}
      </Stack>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <UploadFileModal
        open={uploadModal.value}
        onClose={() => uploadModal.onFalse()}
        onUploaded={handleNewUploadedDocuments}
      />
    </CustomNodeContainer>
  )
}
