import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'
import { Box, Button } from '@mui/material'
import axios from 'axios'
import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { createCompany, updateCompany } from '../../../shared/api/actions/admin.ts'
import { COMPANY_STATUSES } from '../../../shared/constants/company.ts'
import { ADMIN_PANEL_PATH } from '../../../shared/constants/routes.ts'
import { SnackbarContext } from '../../../context/SnackbarContext.tsx'
import { Company } from '../../../types/Company.ts'
import { CompanyFormData, companySchema } from '../../../utils/vaidation/company.ts'
import CompanyFormFields from './CompanyFormFields.tsx'

interface CreateCompanyFormProps {
  company?: Company
  onUpdate?: () => void
}

export default function CreateCompanyForm({ company, onUpdate }: CreateCompanyFormProps) {
  const navigate = useNavigate()
  const { setSnackbar } = useContext(SnackbarContext)
  const isEditingMode = !!company

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    mode: 'all',
    defaultValues: {
      name: company ? company.name : '',
      description: company ? company.description : '',
      status: company ? company.status : COMPANY_STATUSES.ACTIVE,
      email: company ? company.email : '',
    },
  })

  const create = useMutation(createCompany)
  const update = useMutation(['updateCompany'], (variables: { companyId: string; data: CompanyFormData }) =>
    updateCompany(variables.companyId, variables.data),
  )

  const uploadAvatar = async (url: string, file: File) => {
    await axios.request({
      url: url,
      method: 'PUT',
      headers: {
        'Content-type': file.type,
      },
      data: file,
    })
  }

  const onSubmit = async (data: CompanyFormData) => {
    try {
      if (!isEditingMode) {
        const response = (await create.mutateAsync({
          ...data,
          avatar: data.avatar && {
            filename: data.avatar.name,
            contentType: data.avatar.type,
          },
        })) as { avatarPresinedUrl?: string }

        if (response.avatarPresinedUrl) {
          await uploadAvatar(response.avatarPresinedUrl, data.avatar)
        }

        setSnackbar({ text: 'Company created successfully', severity: 'success' })
        navigate(ADMIN_PANEL_PATH)
      } else {
        const response = (await update.mutateAsync({
          companyId: company!.companyId,
          data: {
            ...data,
            avatar: data.avatar && {
              filename: data.avatar.name,
              contentType: data.avatar.type,
            },
          },
        })) as { avatarPresinedUrl?: string }

        if (response.avatarPresinedUrl) {
          await uploadAvatar(response.avatarPresinedUrl, data.avatar)
        }
        setSnackbar({ text: 'Company updated successfully', severity: 'success' })
        onUpdate?.()
      }
    } catch (error) {
      console.error('Error creating company:', error)
      setSnackbar({ text: 'Error creating company', severity: 'error' })
    }
  }

  const handleCancel = () => {
    isEditingMode ? onUpdate?.() : navigate(ADMIN_PANEL_PATH)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <Box display="flex" flexDirection="column" alignItems="start" justifyContent="start" width="100%" gap={3}>
        <CompanyFormFields
          register={register}
          errors={errors}
          control={control}
          avatarUrl={company?.avatarPresinedUrl}
        />
        <Box display="flex" justifyContent="end" alignItems="end" gap={2} width="100%">
          <Button variant="text" type="reset" onClick={handleCancel}>
            Cancel
          </Button>
          <LoadingButton
            sx={{ width: '110px' }}
            variant="contained"
            type="submit"
            disabled={create.isLoading || update.isLoading}
            loading={create.isLoading || update.isLoading}
            loadingPosition="end"
          >
            Save
          </LoadingButton>
        </Box>
      </Box>
    </form>
  )
}
