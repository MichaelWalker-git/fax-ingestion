import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material'
import { fetchUserAttributes } from 'aws-amplify/auth'
import { useCallback, useEffect, useState } from 'react'
import EditProfileForm from '../components/EditProfileForm.tsx'
import ProfileView from '../components/ProfileView.tsx'

export default function ProfilePage() {
  const [userAttributes, setUserAttributes] = useState<{ email?: string; phone_number?: string } | undefined>()
  const [editing, setEditing] = useState(false)

  const getUserAttributes = useCallback(async () => {
    try {
      const userAttributes = await fetchUserAttributes()
      setUserAttributes(userAttributes)
    } catch (error) {
      console.log(error)
    }
  }, [])

  useEffect(() => {
    getUserAttributes()
  }, [getUserAttributes])

  return (
    <Box display="flex" justifyContent="center">
      <Paper sx={{ p: 4, width: '40%' }}>
        <Box width="100%" display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" gutterBottom>
              Profile
            </Typography>
            <Button onClick={() => setEditing(!editing)}>Edit</Button>{' '}
          </Box>
          {!userAttributes && <CircularProgress />}
          {editing && userAttributes ? (
            <EditProfileForm
              userAttributes={userAttributes}
              onCancel={() => {
                setEditing(false)
                getUserAttributes()
              }}
            />
          ) : (
            <ProfileView userAttributes={userAttributes} />
          )}
        </Box>
      </Paper>
    </Box>
  )
}
