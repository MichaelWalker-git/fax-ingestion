import { Box } from '@mui/material'
import { UserAttributes } from '../../../types/User.ts'
import AttributeView from './AttributeView.tsx'

interface ProfileFormProps {
  userAttributes?: UserAttributes
}

export default function ProfileView({ userAttributes }: ProfileFormProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="start" justifyContent="start" width="100%" gap={3}>
      {userAttributes && (
        <>
          <AttributeView label="Email" value={userAttributes?.email || ''} />
          <AttributeView label="Phone Number" value={userAttributes?.phone_number || ''} />
          <AttributeView label="Given Name" value={userAttributes?.given_name || ''} />
          <AttributeView label="Family Name" value={userAttributes?.family_name || ''} />
        </>
      )}
    </Box>
  )
}
