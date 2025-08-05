import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import { Alert, Box, Button, CircularProgress, IconButton as MuiIconButton, Paper, Typography } from '@mui/material'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { getCompany } from '../../../shared/api/actions/admin.ts'
import CompanyView from '../components/CompanyView.tsx'
import CreateCompanyForm from '../components/CreateCompanyForm.tsx'
import UsersList from '../components/UsersList.tsx'
import { USER_ROLES } from '../../../shared/constants/roles.ts'
import { ADMIN_PANEL_PATH } from '../../../shared/constants/routes.ts'
import { Company } from '../../../types/Company.ts'

export default function CompanyViewPage() {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const { isLoading, error, data, refetch } = useQuery<{ company: Company }>(
    `getCompany/${companyId}`,
    getCompany(companyId! as string),
  )

  const [editing, setEditing] = useState(false)

  return (
    <Box display="flex" justifyContent="center" flexDirection="column" gap={2}>
      <Paper sx={{ p: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Box width="50%" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
          <Box width="100%" display="flex" justifyContent="space-between" alignItems="baseline">
            <MuiIconButton onClick={() => navigate(ADMIN_PANEL_PATH)} color="inherit" size="large">
              <ArrowBackIosIcon />
            </MuiIconButton>
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
      <Paper>
        <UsersList userRole={USER_ROLES.TENANT_ADMIN} tenantId={companyId} header="Company Admins" />
      </Paper>
    </Box>
  )
}
