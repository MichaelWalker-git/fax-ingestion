import { Stack, Typography } from '@mui/material'
import { FILE_STATUSES } from '../../../../../shared/constants/file-constants.ts'
import Iconify from '../../../../../shared/components/iconify'

interface CustomNodeDocumentItemProps {
  name: string
  status?: string
  additionText?: string
}

export default function CustomNodeDocumentItem({ name, status, additionText }: CustomNodeDocumentItemProps) {
  return (
    <Stack
      direction="row"
      sx={{ p: 1, border: '1px dashed #ccc', borderRadius: '8px', gap: 1 }}
      justifyContent="space-between"
    >
      <Stack direction="row" gap={1}>
        <Typography variant="caption">{name}</Typography>
        {status === FILE_STATUSES.PROCESSED && (
          <Iconify icon="ic:baseline-check" sx={{ width: 20, height: 20 }} color="primary.main" />
        )}
      </Stack>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'textPrimary' }}>
        {additionText || ''}
      </Typography>
    </Stack>
  )
}
