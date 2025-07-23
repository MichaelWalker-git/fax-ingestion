import { TextField } from '@mui/material'
import { UseFormRegister } from 'react-hook-form'

interface FilledTextInputProps {
  placeholder: string
  register: UseFormRegister<any>
  name: string
  rules?: any
  error?: boolean
  helperText?: string
}

export default function FilledTextInput({
  placeholder,
  name,
  register,
  rules,
  error,
  helperText,
}: FilledTextInputProps) {
  return (
    <TextField
      {...register(name, rules)}
      size="small"
      variant="filled"
      error={error}
      helperText={helperText}
      sx={{
        backgroundColor: 'background.paper',
        '& .MuiFilledInput-root': {
          padding: '8px !important',
          p: 1,
          backgroundColor: 'white',
          borderBottom: '1px solid #ccc',
          borderRadius: 0,
          '&:hover': {
            backgroundColor: 'white',
          },
          '&.Mui-focused': {
            backgroundColor: 'white',
          },
        },
        '& .MuiFilledInput-input': {
          p: 0,
        },
      }}
      placeholder={placeholder}
    />
  )
}
