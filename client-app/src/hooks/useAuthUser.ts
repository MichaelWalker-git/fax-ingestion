// src/hooks/useAuthUser.ts
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getTokens } from '../utils/cognitoService'; // our helper
import { ADMIN_ROLES } from '../constants/roles';

interface DecodedIdToken {
  sub: string;
  email?: string;
  'custom:userRole'?: string;
  'custom:tenantId'?: string;
  [key: string]: any;
}

export default function useAuthUser() {
  const [isUserAdmin, setIsUserAdmin] = useState<boolean | null>(null);
  const [userAttributes, setUserAttributes] = useState<DecodedIdToken | undefined>();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const tokens = getTokens();
      if (!tokens?.idToken) {
        setIsUserAdmin(false);
        return;
      }

      const decoded = jwtDecode<DecodedIdToken>(tokens.idToken);
      setUserAttributes(decoded);
      setUserId(decoded.sub || null);
      setIsUserAdmin(ADMIN_ROLES.includes(decoded['custom:userRole'] || ''));
    }

    loadUser();
  }, []);

  return {
    isUserAdmin,
    userId,
    userRole: userAttributes?.['custom:userRole'],
    userTenantId: userAttributes?.['custom:tenantId'],
    userAttributes,
  };
}
