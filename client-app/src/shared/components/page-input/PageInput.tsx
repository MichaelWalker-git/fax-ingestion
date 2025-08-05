import { Stack, TextField, Typography } from '@mui/material'

interface PageInputProps {
  value: string | number
  onChange: (value: string) => void
  onEnter: (e: React.KeyboardEvent) => void
  length: number
}

export default function PageInput({ value: pageInput, onChange: setPageInput, onEnter, length }: PageInputProps) {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <TextField
        size="small"
        sx={{ width: '64px' }}
        value={pageInput}
        onChange={(e) => setPageInput(e.target.value)}
        onKeyDown={onEnter}
        type="number"
      />
      <Typography color="textDisabled"> / {length}</Typography>
    </Stack>
  )
}
