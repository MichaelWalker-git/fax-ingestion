import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { CircularProgress } from '@mui/material'
import { GridActionsCellItem, GridColDef, GridRowParams } from '@mui/x-data-grid'
import { USER_ROLES_PRETTY_NAMES } from '../../../shared/constants/roles.ts'
import { User } from '../../../types/User.ts'

export const getColumns = (
  onDisable: (id: string) => void,
  onEnable: (id: string) => void,
  disabling: string[],
  currentUserId?: string,
): GridColDef<User>[] => [
  {
    field: 'email',
    headerName: 'Email',
    width: 350,
  },
  {
    field: 'givenName',
    headerName: 'Given Name',
    width: 200,
  },
  {
    field: 'familyName',
    headerName: 'Family Name',
    width: 200,
  },
  {
    field: 'createdAt',
    headerName: 'Creation Date',
    type: 'date',
    width: 200,
    valueGetter: (value: string) => new Date(value),
  },
  {
    field: 'userRole',
    headerName: 'User Role',
    width: 300,
    valueGetter: (value: string) => USER_ROLES_PRETTY_NAMES[value],
  },
  {
    field: 'enabled',
    headerName: 'Enabled',
    width: 70,
    type: 'boolean',
    sortable: false,
  },
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 100,
    getActions: ({ id, row }: GridRowParams) => {
      const actions = []

      if (currentUserId === row.userId) {
        return []
      }

      if (disabling.includes(`${id}`)) {
        return [<CircularProgress key={id} sx={{ width: '18px !important', height: '18px !important' }} />]
      }

      if (row.enabled) {
        actions.push(
          <GridActionsCellItem
            key={id}
            icon={<LockIcon />}
            label="Save"
            sx={{
              color: 'primary.main',
            }}
            title="Block user"
            onClick={() => onDisable(id as string)}
          />,
        )
      } else {
        actions.push(
          <GridActionsCellItem
            key={id}
            icon={<LockOpenIcon />}
            label="Save"
            sx={{
              color: 'primary.main',
            }}
            title="Unblock user"
            onClick={() => onEnable(id as string)}
          />,
        )
      }

      return actions
    },
  },
]
