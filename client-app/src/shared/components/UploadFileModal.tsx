import { Box, Button, LinearProgress, Modal, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Iconify from './iconify'
import FileThumbnail from './file-thumbnail'
import { getFileFormat } from '../../utils/files.ts'
import { UploadedFile } from '../../types/File.ts'
import { useUploadFiles } from '../hooks/useUploadFiles.ts'
import LoadingButton from '@mui/lab/LoadingButton'

interface UploadFileModalProps {
  open: boolean
  onClose: () => void
  onUploaded: (uploadedFiles: UploadedFile[]) => void
}

const MAX_FILES = 8

export default function UploadFileModal({ open, onClose, onUploaded }: UploadFileModalProps) {
  const [files, setFiles] = useState<File[]>([])

  const { uploading, uploadProgress, handleUpload, cancelUpload, clearProgress } = useUploadFiles()

  const onDrop = (acceptedFiles: File[]) => {
    if (files.find((file) => file.name === acceptedFiles[0].name)) {
      return
    }
    setFiles((prev) => [...prev, ...acceptedFiles.slice(0, files.length >= MAX_FILES ? 0 : MAX_FILES - files.length)])
  }

  const dropzone = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpeg', '.jpg'],
      'application/pdf': ['.pdf'],
      'application/doc': ['.doc'],
      'application/docx': ['.docx'],
      'application/txt': ['.txt'],
    },
  })

  useEffect(() => {
    const allFilesUploaded = files.every((file) => uploadProgress[file.name]?.progress === 100)
    if (allFilesUploaded && files.length > 0) {
      handleClose()

      const uploadedFiles: UploadedFile[] = files
        .filter((file) => uploadProgress[file.name]?.fileId)
        .map((file) => ({ ...file, name: file.name, fileId: uploadProgress[file.name]?.fileId! }))
      onUploaded(uploadedFiles)
    }
  }, [uploadProgress, files, onUploaded])

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName))
  }

  const handleClose = () => {
    setFiles([])
    clearProgress()
    onClose()
  }

  const handleCancelUpload = (fileName: string, fileId: string) => {
    cancelUpload(fileName, fileId)
    setFiles((prev) => prev.filter((file) => file.name !== fileName))
  }

  const inputProps = dropzone.getInputProps()
  const rootProps = dropzone.getRootProps()

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2 }} display="flex" flexDirection="column" gap={3}>
        <Typography variant="h6" id="parent-modal-title" sx={{ my: 0 }}>
          Add Documents
        </Typography>
        <Box>
          <div
            {...rootProps}
            style={{
              border: '1px dashed #ccc',
              borderRadius: 16,
              padding: 40,
              textAlign: 'center',
              cursor: files.length >= MAX_FILES ? 'not-allowed' : 'pointer',
              minWidth: 600,
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
            }}
          >
            <input {...inputProps} disabled={files.length >= MAX_FILES} />
            <Stack justifyContent="center" alignItems="center" gap={1}>
              <Iconify icon="ic:round-upload-file" color="text.secondary" width="40px" height="40px" />
              <Typography variant="body2">
                {files.length >= MAX_FILES ? (
                  'You can only upload 8 files at a time.'
                ) : (
                  <>
                    Drag & drop your files or{' '}
                    <Box component="span" color="success.main">
                      click to upload
                    </Box>
                  </>
                )}
              </Typography>
            </Stack>
          </div>
          <Stack direction="row" justifyContent="space-between" mt={1}>
            <Typography variant="caption" color="textSecondary">
              Supported formats: PDF, PNG, JPG
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Max file size: 50MB
            </Typography>
          </Stack>
        </Box>
        <Stack gap={2}>
          {files.map((file) => (
            <Stack key={file.name} sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2 }} gap={1}>
              <Stack direction="row" gap={2} alignItems="center">
                <FileThumbnail file={file} sx={{ width: 32, height: 32 }} />
                <Stack direction="row" justifyContent="space-between" flex={1} alignItems="center">
                  <Stack>
                    <Typography variant="subtitle2">{file.name}</Typography>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <Typography variant="caption" color="textSecondary">
                        {getFileFormat(file.name)}
                      </Typography>
                      <Box
                        component="span"
                        sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {Number(file.size / 1000).toFixed(1)} KB
                      </Typography>
                    </Stack>
                  </Stack>

                  <Iconify
                    icon={uploadProgress[file.name]?.progress ? 'ic:round-close' : 'ic:outline-delete'}
                    sx={{ cursor: 'pointer' }}
                    onClick={() =>
                      uploadProgress[file.name]?.progress
                        ? handleCancelUpload(file.name, uploadProgress[file.name]?.fileId!)
                        : removeFile(file.name)
                    }
                    color="text.secondary"
                  />
                </Stack>
              </Stack>
              {uploadProgress[file.name]?.progress && (
                <LinearProgress variant="determinate" value={uploadProgress[file.name]?.progress} />
              )}
            </Stack>
          ))}
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            onClick={() => handleUpload(files)}
            disabled={files.length === 0 || uploading}
            loading={uploading}
          >
            Upload
          </LoadingButton>
        </Box>
      </Box>
    </Modal>
  )
}
