import { Stack } from '@mui/material'
import { USER_ROLES } from '../../../shared/constants/roles.ts'
import UsersList from './UsersList.tsx'

export default function Superadmin() {
  return (
    <Stack gap={2}>
      <UsersList header="System Admins" userRole={USER_ROLES.SYSTEM_ADMIN} />
    </Stack>
  )
}
