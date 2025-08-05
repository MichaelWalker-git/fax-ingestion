import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'

export const configureAmplify = () => {
  Amplify.configure(
    {
      API: {
        REST: {
          restAPI: {
            endpoint: import.meta.env.VITE_API_ENDPOINT!,
          },
        },
      },
      Auth: {
        Cognito: {
          userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID!,
          userPoolId: import.meta.env.VITE_USER_POOL_ID!,
          identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID!,
          loginWith: {
            username: true,
            email: true,
          },
          allowGuestAccess: true,
          mfa: {
            smsEnabled: true,
            status: 'off',
            totpEnabled: false,
          },
          passwordFormat: {
            minLength: 8,
            requireLowercase: false,
            requireNumbers: false,
            requireSpecialCharacters: false,
            requireUppercase: false,
          },
          userAttributes: {
            email: {
              required: true,
            },
          },
        },
      },
    },
    {
      API: {
        GraphQL: {
          headers: async () => {
            return {
              Authorization: (await fetchAuthSession()).tokens?.idToken?.toString() as string,
            }
          },
        },
        REST: {
          headers: async () => {
            return {
              Authorization: `Bearer ${(await fetchAuthSession()).tokens?.idToken?.toString()}`,
            }
          },
        },
      },
    },
  )
}
