import { getInputPresignsPut } from '../api/actions/presign.ts'
import axios from 'axios'
import { use, useState } from 'react'
import { useMutation } from 'react-query'
import { deleteDocument } from '../api/actions/document.ts'
import { SnackbarContext } from '../../context/SnackbarContext.tsx'

interface FileUploadState {
  [key: string]: {
    progress?: number
    error?: string
    fileId?: string
    cancelTokenSource?: ReturnType<typeof axios.CancelToken.source>
    name?: string
  }
}

export function useUploadFiles() {
  const { setSnackbar } = use(SnackbarContext)

  const { mutate: deleteDocumentMutate } = useMutation(deleteDocument, {
    onError: (error) => {
      console.error('Error deleting document:', error)
      setSnackbar({ text: 'Error deleting document:', severity: 'error' })
    },
  })

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<FileUploadState>({})

  const handleUpload = async (files: File[]) => {
    setUploading(true)
    const presignedUrls = await getInputPresignsPut(files)

    const presignedUrlsMap = new Map(presignedUrls.map((presignedUrl) => [presignedUrl.filename, presignedUrl]))

    await Promise.allSettled(
      files.map(async (file) => {
        const cancelTokenSource = axios.CancelToken.source()
        let uploadUrl: string | undefined
        try {
          const presignedUrl = presignedUrlsMap.get(file.name)

          if (!presignedUrl) {
            return
          }

          uploadUrl = presignedUrl.putUrl

          const { fileId, message } = presignedUrl

          if (!uploadUrl) {
            setUploadProgress((prevState) => ({ ...prevState, [file.name]: { error: message } }))
            return Promise.reject(message)
          }
          setUploadProgress((prevState) => ({
            ...prevState,
            [file.name]: { fileId: fileId, cancelTokenSource, name: file.name },
          }))
        } catch (error) {
          console.log('error', error)
          return Promise.reject(error)
        }
        return axios
          .request({
            url: uploadUrl,
            method: 'PUT',
            headers: {
              'Content-type': file.type,
            },
            data: file,
            cancelToken: cancelTokenSource.token,
            onUploadProgress: (p) => {
              if (p?.progress) {
                const progress = p.progress * 100
                setUploadProgress((prevState) => ({ ...prevState, [file.name]: { ...prevState[file.name], progress } }))
              }
            },
          })
          .catch((error) => {
            if (axios.isCancel(error)) {
              console.log(`Upload cancelled for ${file.name}`)
            } else {
              console.error('File upload failed', error)
            }

            setUploadProgress((prevState) => ({ ...prevState, [file.name]: { error: error } }))
          })
      }),
    )
    setUploading(false)
  }

  const handleCancelUpload = (fileName: string, fileId: string) => {
    const tokenSource = uploadProgress[fileName]?.cancelTokenSource
    if (tokenSource) {
      tokenSource.cancel(`Upload canceled by user for ${fileName}`)
    }

    deleteDocumentMutate(fileId)

    setUploadProgress((prevState) => {
      const newState = { ...prevState }
      delete newState[fileName]
      return newState
    })
  }

  const isFileUploading = (fileName: string) => {
    const fileState = uploadProgress[fileName]
    return fileState?.progress !== undefined && fileState?.progress < 100
  }

  return {
    uploading,
    uploadProgress,
    handleUpload,
    setUploadProgress,
    handleCancelUpload,
    cancelUpload: handleCancelUpload,
    clearProgress: () => setUploadProgress({}),
    isFileUploading,
  }
}
