import { Box, Stack, Typography } from '@mui/material'
import React from 'react'
import Iconify from '../../../../../shared/components/iconify'

interface SidePanelNodeProps {
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void
  type: string
  title: string
  subtitle?: string
  icon?: {
    isCustom?: boolean
    name: string
  }
}

export default function SidePanelNode({ onDragStart, type, title, subtitle, icon }: SidePanelNodeProps) {
  return (
    <Stack
      direction="row"
      sx={{
        px: 2,
        py: 1,
        borderRadius: '12px',
        backgroundColor: 'background.neutral',
        cursor: 'grab',
        gap: 2,
        alignItems: 'center',
      }}
      draggable
      onDragStart={(event) => onDragStart(event, type)}
    >
      {icon &&
        (icon.isCustom ? (
          <Box component="img" src={icon.name} alt="gmail" sx={{ width: 32, height: 32 }} />
        ) : (
          <Iconify icon={icon.name} sx={{ width: 32, height: 32 }} />
        ))}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 0 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  )
}
