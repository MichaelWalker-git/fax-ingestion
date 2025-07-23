import { CircularProgress, IconButton, Stack, Typography } from '@mui/material'
import Iconify from '../../../../../shared/components/iconify'
import { useReactFlow } from '@xyflow/react'
import { useProcessingFlow } from '../../../flow/context/ProcessingFlowContext.tsx'

interface CustomNodeHeaderProps {
  children: React.ReactNode
  nodeId: string
  loading?: boolean
  onOpen?: () => void
  showCheckIcon?: boolean
}

export default function CustomNodeHeader({ children, nodeId, loading, onOpen, showCheckIcon }: CustomNodeHeaderProps) {
  const { getCustomNode, putCustomNode } = useProcessingFlow()

  const customNode = getCustomNode(nodeId)

  const { deleteElements } = useReactFlow()

  const handleCollapse = () => {
    // @ts-ignore
    putCustomNode({
      ...customNode,
      isCollapsed: customNode ? !customNode.isCollapsed : false,
    })
  }

  const handleDelete = () => {
    deleteElements({ nodes: [{ id: nodeId }] })
  }

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" gap={1} alignItems="center">
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 0 }}>
          {children}
        </Typography>
        {loading && <CircularProgress color="inherit" sx={{ width: '16px !important', height: '16px !important' }} />}
        {showCheckIcon && <Iconify icon="ic:baseline-check" sx={{ width: 20, height: 20 }} color="primary.main" />}
      </Stack>
      <Stack direction="row">
        <IconButton onClick={handleCollapse}>
          <Iconify
            icon={customNode?.isCollapsed ? 'ic:baseline-expand-more' : 'ic:baseline-expand-less'}
            sx={{ width: 20, height: 20 }}
            color="primary.main"
          />
        </IconButton>
        {onOpen && !loading && (
          <IconButton onClick={onOpen}>
            <Iconify color="primary.main" icon="mingcute:fullscreen-2-line" sx={{ width: 20, height: 20 }} />
          </IconButton>
        )}
        <IconButton onClick={handleDelete}>
          <Iconify icon="mingcute:close-line" sx={{ width: 20, height: 20 }} />
        </IconButton>
      </Stack>
    </Stack>
  )
}
