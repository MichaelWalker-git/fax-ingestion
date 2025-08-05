import { Stack, Typography } from '@mui/material'
import FileThumbnail from '../file-thumbnail'
import { getFileFormat } from '../../../utils/files.ts'

interface FileLabelProps {
  filename: string
  withoutText?: boolean
}

export default function FileLabel({ filename, withoutText }: FileLabelProps) {
  const fileFormat = getFileFormat(filename)

  return (
    <Stack direction="row" sx={{ bgcolor: 'background.neutral', p: 0.5, width: 'fit-content', borderRadius: 1 }}>
      <FileThumbnail file={fileFormat || ''} sx={{ width: 24, height: 24, mr: withoutText ? 0 : 1 }} />
      {!withoutText && (
        <Typography variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 500, pr: 0.5 }}>
          {fileFormat}
        </Typography>
      )}
    </Stack>
  )
}
