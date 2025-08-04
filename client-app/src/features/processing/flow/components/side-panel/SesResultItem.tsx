import { CircularProgress, Stack, Typography } from '@mui/material'
import { EmailTriggerResult } from '../../../../../types/EmailTrigger.ts'
import Iconify from '../../../../../shared/components/iconify'
import { formatDate } from '../../../../../utils/date.ts'
import { FILE_STATUSES } from '../../../../../shared/constants/file-constants.ts'

interface SesResultItemProps {
  resultItem: EmailTriggerResult
}

export default function SesResultItem({ resultItem }: SesResultItemProps) {
  return (
    <Stack
      sx={{
        p: 2,
        gap: 1,
        border: '1px solid',
        borderColor: 'action.selected',
        borderRadius: 1,
        width: '100%',
        bgcolor: resultItem.status === FILE_STATUSES.PROCESSED ? 'primaryTransparent' : undefined,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">{resultItem.fromAddress}</Typography>
        {resultItem.status === FILE_STATUSES.IN_PROGRESS ? (
          <CircularProgress color="inherit" sx={{ width: '20px !important', height: '20px !important' }} />
        ) : (
          <Iconify icon="ic:baseline-check" sx={{ width: 20, height: 20 }} color="primary.main" />
        )}
      </Stack>
      <Stack>
        {resultItem.attachments?.map((attachment) => (
          <Stack key={attachment.fileId} direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Iconify icon="eva:attach-2-fill" color="text.secondary" />
            <Typography variant="body2">{attachment.filename}</Typography>
          </Stack>
        ))}
      </Stack>
      <Typography variant="caption">{formatDate(resultItem.updatedAt)}</Typography>
    </Stack>
  )
}
