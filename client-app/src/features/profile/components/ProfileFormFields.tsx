import { Box, TextField } from '@mui/material'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { ProfileFormData } from '../../../utils/vaidation/profile.ts'

interface ProfileFormProps {
  register: UseFormRegister<ProfileFormData>
  errors: FieldErrors<ProfileFormData>
  editMode?: boolean
}

export default function ProfileFormFields({ register, errors, editMode = false }: ProfileFormProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="start" justifyContent="start" width="100%" gap={3}>
      <TextField
        {...register('email')}
        label="Email"
        variant="filled"
        fullWidth
        error={!!errors.email}
        helperText={errors.email ? errors.email.message : ''}
        disabled={editMode}
      />
      <TextField
        {...register('phoneNumber')}
        label="Phone Number"
        variant="filled"
        fullWidth
        error={!!errors.phoneNumber}
        helperText={errors.phoneNumber ? errors.phoneNumber.message : ''}
      />
      <TextField
        {...register('givenName')}
        label="Given Name"
        variant="filled"
        fullWidth
        error={!!errors.givenName}
        helperText={errors.givenName ? errors.givenName.message : ''}
      />
      <TextField
        {...register('familyName')}
        label="Family Name"
        variant="filled"
        fullWidth
        error={!!errors.familyName}
        helperText={errors.familyName ? errors.familyName.message : ''}
      />
    </Box>
  )
}
