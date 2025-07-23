import { Stack, Typography } from '@mui/material'

interface DocumentDetailsItemProps {
  name: string
  value?: string
}

export default function DocumentDetailsItem({ name, value }: DocumentDetailsItemProps) {
  return (
    <Stack direction="row">
      <Typography variant="body2" flex={1} color="textSecondary">
        {name}
      </Typography>
      <Typography variant="body2" flex={1}>
        {value}
      </Typography>
    </Stack>
  )
}
