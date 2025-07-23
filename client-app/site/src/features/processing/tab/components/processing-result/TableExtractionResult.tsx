import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { DataGrid, GridValidRowModel } from '@mui/x-data-grid'
import { Table } from '../../../../../types/Table.ts'
import { MapTableProcessingResult } from '../../../../../types/ProcessingResults.ts'
import { handleColumns, isMapProcessingResultArray, mergeTableResults } from './helpers.tsx'

interface TableExtractionResultProps {
  result: Table[] | MapTableProcessingResult[] | MapTableProcessingResult
  gridRef?: React.MutableRefObject<any>
  loading?: boolean
  height?: string
}

export default function TableExtractionResult({ result, gridRef, loading, height }: TableExtractionResultProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    )
  }

  let tables: Table[]

  if (isMapProcessingResultArray(result)) {
    tables = mergeTableResults(result as MapTableProcessingResult[])
  } else if ((result as MapTableProcessingResult)?.result) {
    tables = (result as MapTableProcessingResult)?.result as unknown as Table[]
  } else {
    tables = result as Table[]
  }

  return (
    <Box
      sx={{
        height: height,
        overflowY: 'auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {Array.isArray(tables) &&
        tables?.map((table, index) => (
          <Box key={table.tableName}>
            <Typography mb={2} align="center" variant="subtitle1">
              {table.tableName}
            </Typography>
            <DataGrid
              apiRef={gridRef}
              columns={handleColumns(tables[index].columns)}
              rows={tables[index].rows as unknown as GridValidRowModel[]}
              columnGroupingModel={tables[index].columnGroups}
              sx={{ maxWidth: 800 }}
              disableColumnMenu
              disableColumnResize
              disableColumnSelector
              disableRowSelectionOnClick
              hideFooterPagination
            />
          </Box>
        ))}
      {(!Array.isArray(tables) || tables.length === 0) && <Alert severity="warning"> No table found</Alert>}
    </Box>
  )
}
