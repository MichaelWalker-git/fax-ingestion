import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { getCompany } from '../../../shared/api/actions/admin.ts'
import { USER_ROLES } from '../../../shared/constants/roles.ts'
import useAuthUser from '../../../shared/hooks/useAuthUser.ts'
import { Company } from '../../../types/Company.ts'
import CompanyView from './CompanyView.tsx'
import CreateCompanyForm from './CreateCompanyForm.tsx'
import UsersList from './UsersList.tsx'

export default function TenantAdmin() {
  const { userTenantId } = useAuthUser()

  const { isLoading, error, data, refetch } = useQuery<{ company: Company }>(
    `getCompany/${userTenantId}`,
    getCompany(userTenantId! as string),
  )

  const [editing, setEditing] = useState(false)

  return (
    <Stack gap={2}>
      <Paper sx={{ p: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Box width="50%" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
          <Box width="100%" display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant="h5" gutterBottom>
              Company Details
            </Typography>
            <Button onClick={() => setEditing(!editing)}>Edit</Button>{' '}
          </Box>
          {!!error && (
            <Alert sx={{ width: '100%', display: 'flex', justifyContent: 'center' }} severity="error">
              {(error as Error).message || 'Something went wrong'}
            </Alert>
          )}
          {isLoading && <CircularProgress />}
          {editing && data?.company ? (
            <CreateCompanyForm
              company={data?.company}
              onUpdate={() => {
                setEditing(false)
                refetch()
              }}
            />
          ) : (
            data?.company && <CompanyView company={data?.company} />
          )}
        </Box>
      </Paper>
      {userTenantId && <UsersList userRole={USER_ROLES.USER} tenantId={userTenantId} header="Company users" />}
    </Stack>
  )
}
