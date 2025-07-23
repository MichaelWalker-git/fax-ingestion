import { GridColDef } from '@mui/x-data-grid'
import { Link as RouterLink } from 'react-router-dom'
import { VIEW_COMPANY_PATH } from '../../../shared/constants/routes.ts'
import { Company } from '../../../types/Company.ts'

export const getCompaniesColumns = (): GridColDef<Company>[] => {
  return [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params: { value?: string; row: Company }) => {
        return (
          <RouterLink
            to={VIEW_COMPANY_PATH.replace(':companyId', params.row.companyId as string)}
            style={{ textDecoration: 'none', fontWeight: '500', color: '#1976d2' }}
          >
            {params.value}
          </RouterLink>
        )
      },
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
    },
    {
      field: 'createdAt',
      headerName: 'Creation Date',
      flex: 1,
      type: 'date',
      valueGetter: (value: string) => new Date(value),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
    },
  ]
}
