import { Handle, Position } from '@xyflow/react'
import { Typography } from '@mui/material'

interface LabeledHandleProps {
  id: string
  left: string
  label: string
  type?: 'source' | 'target'
}

export default function LabeledHandle({ id, left, label, type = 'source' }: LabeledHandleProps) {
  return (
    <>
      <Handle
        type={type}
        position={Position.Bottom}
        id={id}
        style={{
          left: left,
          zIndex: 2,
        }}
      />
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: '12px',
          left: left,
          transform: 'translateX(-50%)',
          backgroundColor: 'primary.main',
          color: 'common.white',
          px: 0.5,
          py: 0.25,
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          whiteSpace: 'nowrap',
          zIndex: 1,
        }}
      >
        {label}
      </Typography>
    </>
  )
}
