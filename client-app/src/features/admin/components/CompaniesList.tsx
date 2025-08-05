import { Box, Button, Paper, Typography } from '@mui/material'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { fetchCompanies } from '../../../shared/api/actions/admin.ts'
import { CREATE_COMPANY_PATH } from '../../../shared/constants/routes.ts'
import { Company } from '../../../types/Company.ts'
import { getCompaniesColumns } from '../helpers/helpers.tsx'

export default function CompaniesList() {
  const { isLoading, error, data } = useQuery<{ companies: Company[] }>('companies', fetchCompanies())

  return (
    <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Companies
        </Typography>
        <Button to={CREATE_COMPANY_PATH} component={Link}>
          create company
        </Button>
      </Box>
      {error ? (
        <Typography variant="body1" color="error">
          {(error as Error)?.message || 'An error occurred'}
        </Typography>
      ) : null}
      <DataGrid
        rows={data?.companies}
        columns={getCompaniesColumns()}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[10]}
        disableRowSelectionOnClick
        getRowId={(row) => row.companyId}
        loading={isLoading}
      />
    </Paper>
  )
}
