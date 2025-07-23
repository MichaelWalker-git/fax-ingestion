import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'
import { Box, Button } from '@mui/material'
import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { createUser } from '../../../shared/api/actions/admin.ts'
import ProfileFormFields from '../../profile/components/ProfileFormFields.tsx'
import { SnackbarContext } from '../../../context/SnackbarContext.tsx'
import { ProfileFormData, profileFormSchema } from '../../../utils/vaidation/profile.ts'

export default function CreateUserForm() {
  const navigate = useNavigate()
  const { setSnackbar } = useContext(SnackbarContext)
  const { userRole } = useParams()
  const { tenantId } = useParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    mode: 'all',
    defaultValues: {
      email: '',
      familyName: '',
      givenName: '',
      phoneNumber: '',
    },
  })

  const mutation = useMutation(createUser(userRole!), {
    onSuccess: () => {
      setSnackbar({ text: 'User created successfully', severity: 'success' })
      navigate(-1)
    },
    onError: (error) => {
      console.error('Error creating user:', error)
      setSnackbar({ text: 'Error creating user', severity: 'error' })
    },
  })

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate({ ...data, tenantId })
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <Box display="flex" flexDirection="column" alignItems="start" justifyContent="start" width="100%" gap={3}>
        <ProfileFormFields register={register} errors={errors} />
        <Box display="flex" justifyContent="end" alignItems="end" gap={2} width="100%">
          <Button variant="text" type="reset" onClick={handleCancel}>
            Cancel
          </Button>
          <LoadingButton
            sx={{ width: '110px' }}
            variant="contained"
            type="submit"
            disabled={mutation.isLoading}
            loading={mutation.isLoading}
            loadingPosition="end"
          >
            Save
          </LoadingButton>
        </Box>
      </Box>
    </form>
  )
}
