import { Alert, Box, Card, CircularProgress, Stack, Typography } from '@mui/material'
import { fDate } from '../../../../../../utils/date.ts'
import Iconify from '../../../../../../shared/components/iconify'
import { useTheme } from '@mui/material/styles'
import { decodeBase64 } from '../../../../../../utils/files.ts'
import { useQuery } from 'react-query'
import { getGmailMessage } from '../../../../../../shared/api/actions/gmail.ts'

interface MessagePreviewCardProps {
  messageId: string
}

export default function MessagePreviewCard({ messageId }: MessagePreviewCardProps) {
  const theme = useTheme()

  const { data: message, isLoading, error } = useQuery(`/getMessage/${messageId}`, () => getGmailMessage(messageId))

  if (isLoading) {
    return (
      <Card sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    )
  }

  if (!message || error) {
    return <Alert severity="error">Error loading message</Alert>
  }

  const decodedBody = message.bodyBase64 ? decodeBase64(message.bodyBase64) : ''

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ pb: 2, borderBottom: `dashed 1px ${theme.palette.divider}`, gap: 2 }}
      >
        <Typography variant="subtitle2" flex={6}>
          {message.subject}
        </Typography>
        <Typography variant="caption" color="textDisabled" flex={2} alignSelf="baseline">
          {fDate(message.date, 'dd/MM/yyyy hh:mm a')}
        </Typography>
      </Stack>
      <Stack sx={{ py: 2 }}>
        <Stack direction="row" gap={1} alignItems="center">
          <Typography variant="subtitle2">{message.fromName}</Typography>
          <Typography variant="caption" color="textDisabled">
            {'<'}
            {message.from}
            {'>'}
          </Typography>
        </Stack>

        <Stack direction="row" gap={0.5}>
          <Typography variant="caption">To:</Typography>
          <Typography variant="caption" color="textDisabled">
            {message.to}
          </Typography>
        </Stack>
      </Stack>
      {message.attachments?.length > 0 && (
        <Stack direction="row" sx={{ backgroundColor: 'background.neutral', p: 2, borderRadius: 2 }}>
          <Iconify icon="eva:attach-2-fill" color="primary.main" />
          <Typography variant="subtitle2" color="primary">
            {message.attachments?.length} Attachment
          </Typography>
        </Stack>
      )}
      <Box maxHeight="50vh" sx={{ overflowY: 'auto', overflowX: 'hidden' }}>
        <Typography variant="body2" mt={2}>
          {decodedBody || message.snippet}
        </Typography>
      </Box>
    </Card>
  )
}
