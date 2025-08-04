import { Card } from '@mui/material'
import { NodeProps } from '@xyflow/react'
import React from 'react'

export default function CustomNodeContainer({
  children,
  nodeProps,
  error,
}: { children: React.ReactNode; nodeProps: NodeProps; error?: boolean }) {
  let border = nodeProps.selected ? '2px solid #ccc' : 'none'

  if (error) {
    border = '2px solid red'
  }

  return (
    <Card
      sx={{
        border: border,
        p: 2,
        minWidth: '300px',
        maxWidth: '800px',
        overflow: 'visible',
      }}
    >
      {children}
    </Card>
  )
}
