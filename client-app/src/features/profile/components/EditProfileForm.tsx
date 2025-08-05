import LoadingButton from '@mui/lab/LoadingButton'
import { Box, Button } from '@mui/material'
import { useActionState, useState } from 'react'
import { UserAttributes } from '../../../types/User.ts'
import EditProfileFormFields from './EditProfileFormFields.tsx'
import { handleFormAction } from '../utils/utils.ts'

interface ProfileFormProps {
  userAttributes: UserAttributes
  onCancel: () => void
}

export default function EditProfileForm({ userAttributes, onCancel }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(handleFormAction, {
    errors: {},
    success: null,
  })
  const [attributes, setAttributes] = useState(userAttributes)

  if (state.success) {
    onCancel()
  }

  return (
    <form action={formAction} style={{ width: '100%' }}>
      <Box display="flex" flexDirection="column" alignItems="start" justifyContent="start" width="100%" gap={3}>
        <EditProfileFormFields
          errors={state.errors}
          defaultAttributes={userAttributes}
          attributes={attributes}
          setAttributes={setAttributes}
          editMode
        />
        <Box display="flex" justifyContent="end" alignItems="end" gap={2} width="100%">
          <Button variant="text" type="reset" onClick={onCancel}>
            Cancel
          </Button>
          <LoadingButton
            sx={{ width: '110px' }}
            variant="contained"
            type="submit"
            disabled={isPending}
            loading={isPending}
            loadingPosition="end"
          >
            Save
          </LoadingButton>
        </Box>
      </Box>
    </form>
  )
}
