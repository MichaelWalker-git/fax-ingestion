import { Stack, Typography } from '@mui/material'
import { SxProps, Theme } from '@mui/material/styles'
import { ListItemButtonProps } from '@mui/material/ListItemButton'
import Iconify from '../iconify'

interface BigAddButtonProps {
  onClick?: VoidFunction
  icon: string
  color?: string
  text?: string
  sx?: SxProps<Theme>
  other?: ListItemButtonProps
}

export default function BigAddButton({
  icon,
  color = 'primary',
  sx,
  text = 'Add',
  onClick,
  ...other
}: BigAddButtonProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        py: 2.3,
        px: 3,
        width: '233px',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        color: 'common.white',
        bgcolor: `${color}.dark`,
        cursor: 'pointer',
        ':hover': {
          bgcolor: `${color}.main`,
        },
        ...sx,
      }}
      onClick={onClick}
      {...other}
    >
      <Stack direction="row" gap={3}>
        <Iconify icon="ic-add" sx={{ width: 24, height: 24 }} />
        <Typography variant="h6">{text}</Typography>
      </Stack>
      <Iconify
        icon={icon}
        sx={{
          width: 112,
          right: -32,
          height: 70,
          opacity: 0.08,
          position: 'absolute',
        }}
      />
    </Stack>
  )
}
