import { Box, Paper, Typography } from '@mui/material'
import CreateCompanyForm from '../components/CreateCompanyForm.tsx'

export default function CreateCompany() {
  return (
    <Box display="flex" justifyContent="center">
      <Paper sx={{ p: 4, width: '40%' }}>
        <Typography variant="h6" align="center" mb={2}>
          Create Company Form
        </Typography>
        <CreateCompanyForm />
      </Paper>
    </Box>
  )
}
