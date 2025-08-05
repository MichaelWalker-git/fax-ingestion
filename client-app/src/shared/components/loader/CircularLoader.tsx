import { CircularProgress, Stack, Typography } from '@mui/material'

interface CircularLoaderProps {
  text: string
  secondaryText?: string
}

export default function CircularLoader({ text, secondaryText }: CircularLoaderProps) {
  return (
    <Stack justifyContent="center" alignItems="center" gap={2} flex={1}>
      <CircularProgress />
      <Stack alignItems="center">
        <Typography variant="caption">{text}</Typography>
        {secondaryText && (
          <Typography variant="caption" color="textSecondary">
            {secondaryText}
          </Typography>
        )}
      </Stack>
    </Stack>
  )
}
