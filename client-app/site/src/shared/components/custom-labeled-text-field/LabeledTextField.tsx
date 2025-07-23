import { Stack, TextField, Typography } from '@mui/material'

interface LabeledTextFieldProps {
  label: string
  value: string | number
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  type?: 'text' | 'number'
  placeholder?: string
  disabled?: boolean
  name?: string
  error?: boolean
  helperText?: string
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
}

export default function LabeledTextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  name,
  error,
  helperText,
  onBlur,
}: LabeledTextFieldProps) {
  return (
    <Stack gap={0.5}>
      <Typography variant="subtitle2" sx={{ pl: 0.5 }}>
        {label}
      </Typography>
      <TextField
        size="small"
        fullWidth
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        name={name}
        error={error}
        helperText={helperText}
        onBlur={onBlur}
        className="nodrag"
      />
    </Stack>
  )
}
