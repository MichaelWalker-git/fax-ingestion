import { View, useAuthenticator } from '@aws-amplify/ui-react'
import styled from '@emotion/styled'
import { Link, Paper, Typography } from '@mui/material'

const Wrapper = styled(Paper)`
  padding: 2rem 2rem 0 2rem;
`

export const components = {
  SignIn: {
    Header() {
      return (
        <Wrapper>
          <Typography variant="h4" align="left" gutterBottom style={{ fontWeight: 600 }}>
            Sign in
          </Typography>
        </Wrapper>
      )
    },
    Footer() {
      const BottomFooter = styled(View)`
        padding: 0 2rem 2rem 2rem;
      `
      const { toForgotPassword } = useAuthenticator()

      return (
        <BottomFooter textAlign="center">
          <Link onClick={toForgotPassword}> Forgot your password?</Link>
        </BottomFooter>
      )
    },
  },
}

export const formFields = {
  signUp: {
    phone_number: {
      dialCode: '+1',
      order: 1,
    },
  },
}
