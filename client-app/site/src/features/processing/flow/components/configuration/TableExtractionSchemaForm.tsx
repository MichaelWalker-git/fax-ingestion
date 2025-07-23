import { Button, Stack, Table, TextField, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Iconify from '../../../../../shared/components/iconify'
import { TableHeadCustom } from '../../../../../shared/components/table'
import DataTypeSelect from '../../../../../shared/components/DataTypeSelect.tsx'
import { Column } from '../../../../../types/Table.ts'

interface TableStructureBuilderProps {
  columns?: Column[]
  setColumns: (schema: Column[]) => void
  filenames: string[]
}

const defaultColumn = { field: '', headerName: '', flex: 1, align: 'left', headerAlign: 'left' }

export default function TableExtractionSchemaForm({ columns = [], setColumns, filenames }: TableStructureBuilderProps) {
  const theme = useTheme()

  const tableHead = columns.map(({ headerName }) => ({
    id: headerName,
    label: headerName || 'Column Name',
    disabled: !headerName,
  }))

  return (
    <Stack gap={3}>
      <Typography variant="caption" color="textDisabled">
        Set column names and data types for accurate extraction
      </Typography>
      <Stack alignItems="flex-start">
        <Button
          startIcon={<Iconify icon="ic:baseline-add" />}
          onClick={() => setColumns([...columns, defaultColumn])}
          sx={{ cursor: 'pointer' }}
        >
          Add Column
        </Button>
      </Stack>
      <Stack gap={1} sx={{ p: 1, border: `dashed 1px ${theme.palette.divider}`, borderRadius: 1 }}>
        {filenames.map((filename) => (
          <Typography key={filename}>{filename}</Typography>
        ))}
      </Stack>
      <Stack gap={4} sx={{ p: 1, border: `dashed 1px ${theme.palette.divider}`, borderRadius: 1 }}>
        <Table>
          <TableHeadCustom headLabel={tableHead} />
        </Table>
        <Stack gap={2}>
          {columns?.map((column, index) => (
            <Stack flexDirection="row" gap={1} alignItems="center" key={index}>
              <TextField
                size="small"
                autoFocus
                value={column.field}
                onChange={(e) =>
                  setColumns(
                    columns.map((col, i) =>
                      i === index ? { ...col, field: e.target.value, headerName: e.target.value } : col,
                    ),
                  )
                }
                sx={{ flex: 3 }}
                label="Column Name"
                required
              />
              <DataTypeSelect
                value={column.type}
                onChange={(value) => setColumns(columns.map((col, i) => (i === index ? { ...col, type: value } : col)))}
              />
              <Iconify
                icon="ic:baseline-delete"
                onClick={() => setColumns(columns.filter((_, i) => i !== index))}
                sx={{ cursor: 'pointer', color: 'text.secondary' }}
              />
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}
