import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form'
import { COMPANY_STATUSES, COMPANY_STATUSES_PRETTY } from '../../../shared/constants/company.ts'
import { CompanyFormData } from '../../../utils/vaidation/company.ts'
import AvatarDropzone from '../../../shared/components/AvatarDropzone.tsx'

interface CompanyFormFieldsProps {
  register: UseFormRegister<CompanyFormData>
  errors: FieldErrors<CompanyFormData>
  control: Control<CompanyFormData>
  avatarUrl?: string
}

export default function CompanyFormFields({ register, errors, control, avatarUrl }: CompanyFormFieldsProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="start" width="100%" gap={3}>
      <Controller
        name="avatar"
        control={control}
        render={({ field: { onChange } }) => (
          <AvatarDropzone onFileAccepted={onChange} error={errors.avatar} avatarUrl={avatarUrl} />
        )}
      />
      <TextField
        {...register('name')}
        label="Company Name"
        variant="filled"
        fullWidth
        error={!!errors.name}
        helperText={errors.name ? errors.name.message : ''}
      />
      <TextField
        {...register('email')}
        label="Email"
        variant="filled"
        fullWidth
        error={!!errors.email}
        helperText={errors.email ? errors.email.message : ''}
      />
      <TextField
        {...register('description')}
        label="Description"
        variant="filled"
        fullWidth
        error={!!errors.description}
        helperText={errors.description ? errors.description.message : ''}
        multiline
        rows={2}
      />
      <Controller
        name="status"
        control={control}
        render={({ field: { value, onChange, ref } }) => (
          <FormControl variant="filled" fullWidth error={!!errors.status}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select labelId="status-label" label="Status" value={value} onChange={onChange} inputRef={ref}>
              {Object.values(COMPANY_STATUSES).map((status) => (
                <MenuItem key={status} value={status}>
                  {COMPANY_STATUSES_PRETTY[status]}
                </MenuItem>
              ))}
            </Select>
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
        )}
      />
    </Box>
  )
}
