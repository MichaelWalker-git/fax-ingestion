import { Box, Stack } from '@mui/material'
import Iconify from '../../../shared/components/iconify'
import PageInput from '../../../shared/components/page-input/PageInput.tsx'
import { useState } from 'react'

interface DocumentPreviewProps {
  previewUrls: string[]
}

export default function DocumentPreview({ previewUrls }: DocumentPreviewProps) {
  const [previewIndex, setPreviewIndex] = useState(1)

  const pageToPreview = previewUrls[previewIndex - 1]

  const [pageInput, setPageInput] = useState('')

  const [zoomLevel, setZoomLevel] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 3))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: event.clientX - position.x, y: event.clientY - position.y })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handlePageChange = () => {
    if (pageInput) {
      setPreviewIndex(Number.parseInt(pageInput))
    }
  }

  const handleZoomReset = () => {
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <Stack gap={1}>
      <Stack justifyContent="space-between" direction="row">
        <Stack direction="row" alignItems="center" gap={1}>
          <Iconify
            icon="ic:baseline-search"
            sx={{ cursor: 'pointer' }}
            onClick={handleZoomReset}
            title="Reset Zoom"
            color={'text.secondary'}
          />
          <Iconify
            icon="ic:baseline-zoom-out"
            sx={{ cursor: 'pointer' }}
            onClick={handleZoomOut}
            color={'text.secondary'}
          />
          <Iconify
            icon="ic:baseline-zoom-in"
            sx={{ cursor: 'pointer' }}
            onClick={handleZoomIn}
            color={'text.secondary'}
          />
        </Stack>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={2}>
          <Iconify
            sx={{ cursor: 'pointer' }}
            icon="ic:baseline-expand-less"
            onClick={() => {
              if (previewIndex > 1) {
                const newPreviewIndex = previewIndex - 1
                setPreviewIndex(newPreviewIndex)
                setPageInput(`${newPreviewIndex}`)
              }
            }}
            color={'text.secondary'}
          />
          <PageInput
            value={pageInput}
            onChange={(value) => setPageInput(value)}
            onEnter={handlePageChange}
            length={previewUrls.length}
          />
          <Iconify
            sx={{ cursor: 'pointer' }}
            icon="ic:baseline-expand-more"
            onClick={() => {
              if (previewIndex < previewUrls.length) {
                const newPreviewIndex = previewIndex + 1
                setPreviewIndex(newPreviewIndex)
                setPageInput(`${newPreviewIndex}`)
              }
            }}
            color={'text.secondary'}
          />
        </Stack>
      </Stack>
      <Box
        sx={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={pageToPreview}
          alt="document preview"
          style={{
            borderRadius: '8px',
            minHeight: '400px',
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </Box>
    </Stack>
  )
}
