import Superadmin from '../components/Superadmin.tsx'
import SystemAdmin from '../components/SystemAdmin.tsx'
import TenantAdmin from '../components/TenantAdmin.tsx'
import { USER_ROLES } from '../../../shared/constants/roles.ts'
import useAuthUser from '../../../shared/hooks/useAuthUser.ts'

export default function AdminPanel() {
  const { userRole } = useAuthUser()

  return (
    <>
      {userRole === USER_ROLES.SUPER_ADMIN && <Superadmin />}
      {userRole === USER_ROLES.SYSTEM_ADMIN && <SystemAdmin />}
      {userRole === USER_ROLES.TENANT_ADMIN && <TenantAdmin />}
    </>
  )
}
