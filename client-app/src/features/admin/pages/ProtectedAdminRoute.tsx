import { Navigate, Outlet } from 'react-router-dom'
import { ROOT_PATH } from '../../../shared/constants/routes.ts'
import useAuthUser from '../../../shared/hooks/useAuthUser.ts'

const ProtectedAdminRoute = () => {
  const { isUserAdmin } = useAuthUser()

  if (isUserAdmin === null) {
    return null
  }

  return isUserAdmin ? <Outlet /> : <Navigate to={ROOT_PATH} />
}

export default ProtectedAdminRoute
