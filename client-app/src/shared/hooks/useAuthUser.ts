import { AuthSession, fetchAuthSession } from 'aws-amplify/auth'
import { useEffect, useState } from 'react'
import { ADMIN_ROLES } from '../constants/roles.ts'

export default function useAuthUser() {
  const [isUserAdmin, setIsUserAdmin] = useState<boolean | null>(null)
  const [authSession, setAuthSession] = useState<AuthSession | null>(null)
  const [userAttributes, setUserAttributes] = useState<Record<string, string> | undefined>()

  useEffect(() => {
    async function isUserAdmin() {
      const authUserSession = await fetchAuthSession()
      setAuthSession(authUserSession)
      const { tokens } = await authUserSession
      const payload = tokens?.idToken?.payload as Record<string, string>
      const isUserAdmin = ADMIN_ROLES.includes(payload?.['custom:userRole'])
      setUserAttributes(payload)
      setIsUserAdmin(isUserAdmin)
    }
    isUserAdmin()
  }, [])

  return {
    isUserAdmin,
    userId: authSession?.userSub,
    userRole: userAttributes?.['custom:userRole'],
    userTenantId: userAttributes?.['custom:tenantId'],
    userAttributes,
  }
}
