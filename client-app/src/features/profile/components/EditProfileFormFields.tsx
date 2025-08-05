import { Box, TextField } from '@mui/material'
import { UserAttributes } from '../../../types/User.ts'

interface ProfileFormProps {
  defaultAttributes: UserAttributes
  username?: string
  errors: Record<string, string[]>
  attributes: UserAttributes
  setAttributes: (attributes: UserAttributes) => void
  editMode?: boolean
}

export default function EditProfileFormFields({
  defaultAttributes,
  errors,
  attributes,
  setAttributes,
  editMode,
}: ProfileFormProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="start" justifyContent="start" width="100%" gap={3}>
      <TextField
        name="email"
        label="Email"
        variant="filled"
        defaultValue={defaultAttributes.email ?? ''}
        fullWidth
        error={!!errors.email}
        helperText={errors.email?.[0]}
        value={attributes.email}
        onChange={(e) => setAttributes({ ...attributes, email: e.target.value })}
        disabled={editMode}
      />
      <TextField
        name="phone_number"
        label="Phone Number"
        variant="filled"
        defaultValue={defaultAttributes.phone_number ?? ''}
        fullWidth
        error={!!errors.phone_number}
        helperText={errors.phone_number?.[0]}
        value={attributes.phone_number}
        onChange={(e) => setAttributes({ ...attributes, phone_number: e.target.value })}
      />
      <TextField
        name="given_name"
        label="Given Name"
        variant="filled"
        defaultValue={defaultAttributes.given_name ?? ''}
        fullWidth
        error={!!errors.given_name}
        helperText={errors.given_name?.[0]}
        value={attributes.given_name}
        onChange={(e) => setAttributes({ ...attributes, given_name: e.target.value })}
      />
      <TextField
        name="family_name"
        label="Family Name"
        variant="filled"
        defaultValue={defaultAttributes.family_name ?? ''}
        fullWidth
        error={!!errors.family_name}
        helperText={errors.family_name?.[0]}
        value={attributes.family_name}
        onChange={(e) => setAttributes({ ...attributes, family_name: e.target.value })}
      />
    </Box>
  )
}
