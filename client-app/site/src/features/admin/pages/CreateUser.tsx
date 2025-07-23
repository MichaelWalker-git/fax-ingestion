import { Box, Paper, Typography } from '@mui/material'
import CreateUserForm from '../components/CreateUserForm.tsx'

export default function CreateUser() {
  return (
    <Box display="flex" justifyContent="center">
      <Paper sx={{ p: 4, width: '40%' }}>
        <Typography variant="h6" align="center" mb={2}>
          Create User Form
        </Typography>
        <CreateUserForm />
      </Paper>
    </Box>
  )
}
