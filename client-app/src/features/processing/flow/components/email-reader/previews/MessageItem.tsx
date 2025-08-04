import { Stack, Typography } from '@mui/material'
import Iconify from '../../../../../../shared/components/iconify'
import { GmailMessage } from '../../../../../../types/Gmail.ts'
import { useTheme } from '@mui/material/styles'

interface MessageItemProps {
  message: GmailMessage
  isSelected?: boolean
  onClick?: VoidFunction
}

export default function MessageItem({ message, isSelected, onClick }: MessageItemProps) {
  const theme = useTheme()

  return (
    <Stack
      key={message.id}
      direction="row"
      sx={{
        maxWidth: 360,
        p: 1,
        borderRadius: 1,
        cursor: 'pointer',
        borderBottom: `dashed 1px ${theme.palette.divider}`,
        '&:hover': {
          bgcolor: 'action.hover',
        },
        bgcolor: isSelected ? 'action.selected' : 'common.white',
      }}
      justifyContent="space-between"
      alignItems="center"
      onClick={onClick}
    >
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2">{message.from}</Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {message.subject}
        </Typography>
      </Stack>
      <Stack direction="row" gap={2}>
        {message.attachments.length > 0 && <Iconify icon="eva:attach-2-fill" color="text.secondary" />}
      </Stack>
    </Stack>
  )
}
