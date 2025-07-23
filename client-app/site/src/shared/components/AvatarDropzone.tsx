import ClearIcon from '@mui/icons-material/Clear'
import PersonIcon from '@mui/icons-material/Person'
import { Avatar, Box, IconButton, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'

interface AvatarDropzoneProps {
  onFileAccepted?: (file: File | null) => void
  error?: { message?: string }
  avatarUrl?: string
  disabled?: boolean
}

export default function AvatarDropzone({ onFileAccepted, error, avatarUrl, disabled }: AvatarDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(avatarUrl || null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpeg', '.jpg'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0]

        if (preview) {
          URL.revokeObjectURL(preview)
        }

        const previewURL = URL.createObjectURL(file)
        setPreview(previewURL)
        onFileAccepted?.(file)
      }
    },
    disabled,
  })

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    onFileAccepted?.(null)
  }

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: !preview ? '2px dashed' : 'none',
        borderColor: 'grey.400',
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        position: 'relative',
      }}
    >
      <input {...getInputProps()} />
      {preview ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            src={preview}
            variant="square"
            alt="Avatar preview"
            sx={{ width: 120, height: 120, margin: '0 auto' }}
          />
          {!disabled && (
            <IconButton
              onClick={handleRemove}
              size="small"
              sx={{
                position: 'absolute',
                top: -12,
                right: -12,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              <ClearIcon />
            </IconButton>
          )}
        </Box>
      ) : (
        <Box>
          <Avatar sx={{ width: 120, height: 120, margin: '0 auto', bgcolor: 'grey.300' }}>
            <PersonIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
          </Avatar>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            {isDragActive ? 'Drop the image here...' : 'Drag & drop an avatar image here, or click to select a file'}
          </Typography>
        </Box>
      )}
      {error && (
        <Typography variant="caption" color="error">
          {error.message}
        </Typography>
      )}
    </Box>
  )
}
