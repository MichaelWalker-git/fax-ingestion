import { Box, Button, Paper, Typography } from '@mui/material'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import { del, put } from 'aws-amplify/api'
import { use, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { fetchUsers } from '../../../shared/api/actions/admin.ts'
import { API_NAME, API_USER } from '../../../shared/api/paths.ts'
import { TYPE_USER_ROLES } from '../../../shared/constants/roles.ts'
import { CREATE_USER_PATH } from '../../../shared/constants/routes.ts'
import { SnackbarContext } from '../../../context/SnackbarContext.tsx'
import useAuthUser from '../../../shared/hooks/useAuthUser.ts'
import { User } from '../../../types/User.ts'
import ConfirmationModal from '../../../shared/components/ConfirmationModal.tsx'
import { getColumns } from '../helpers/user-list-helpers.tsx'

interface UsersListProps {
  header?: string
  userRole: TYPE_USER_ROLES
  tenantId?: string
}

export default function UsersList({ header, userRole, tenantId }: UsersListProps) {
  const { isLoading, error, data, refetch } = useQuery<{ users: User[] }>(
    `users/${userRole}/${tenantId}`,
    fetchUsers(userRole!, tenantId),
  )
  const [disabling, setDisabling] = useState<string[]>([])
  const [confirmation, setConfirmation] = useState<{ text: string; onSubmit: () => void } | null>(null)
  const { setSnackbar } = use(SnackbarContext)
  const { userId: currentUserId } = useAuthUser()

  const { mutate: disableUserMutate } = useMutation(async (userId: string) => {
    setDisabling([...disabling, userId])
    await del({
      apiName: API_NAME,
      path: `${API_USER}/${userId}`,
    }).response
    setDisabling(disabling.filter((id) => id !== userId))
    setSnackbar({ text: 'User disabled successfully', severity: 'success' })
    await refetch()
  })

  const { mutate: enableUserMutate } = useMutation(async (userId: string) => {
    setDisabling([...disabling, userId])
    await put({
      apiName: API_NAME,
      path: `${API_USER}/${userId}/enable`,
    }).response
    setDisabling(disabling.filter((id) => id !== userId))
    setSnackbar({ text: 'User enabled successfully', severity: 'success' })
    await refetch()
  })

  const handleDisable = async (id: string) => {
    setConfirmation({
      text: 'Are you sure you want to disable this user?',
      onSubmit: () => {
        disableUserMutate(id)
        setConfirmation(null)
      },
    })
  }

  const handleEnable = async (id: string) => {
    enableUserMutate(id)
  }

  const createUserPath = tenantId
    ? CREATE_USER_PATH.replace(':userRole/:tenantId', `${userRole}/${tenantId}`)
    : CREATE_USER_PATH.replace(':userRole/:tenantId', `${userRole}`)

  return (
    <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          {header || 'Users List'}
        </Typography>
        <Button variant={'outlined'} to={createUserPath} component={Link}>
          Create User
        </Button>
      </Box>
      {error ? (
        <Typography variant="body1" color="error">
          {(error as Error)?.message || 'An error occurred'}
        </Typography>
      ) : null}
      <DataGrid
        rows={data?.users}
        columns={getColumns(handleDisable, handleEnable, disabling, currentUserId)}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[5]}
        disableRowSelectionOnClick
        getRowId={(row) => row.userId}
        loading={isLoading}
      />
      <ConfirmationModal
        open={confirmation !== null}
        onClose={() => setConfirmation(null)}
        text={confirmation?.text}
        onConfirm={confirmation?.onSubmit}
      />
    </Paper>
  )
}
