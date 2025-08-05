import { Authenticator } from '@aws-amplify/ui-react'
import { SignOut } from '@aws-amplify/ui-react/dist/types/components/Authenticator/Authenticator'
import { AuthUser } from 'aws-amplify/auth'
import * as React from 'react'
import { JSX } from 'react'
import { components, formFields } from '../helpers/auth-component-helpers.tsx'
import '@aws-amplify/ui-react/styles.css'

interface Props {
  children: React.ReactNode | ((props: { signOut?: SignOut; user?: AuthUser }) => JSX.Element)
}
export default function AuthenticatorWrapper({ children }: Props) {
  return (
    <Authenticator components={components} formFields={formFields} hideSignUp>
      {children}
    </Authenticator>
  )
}
