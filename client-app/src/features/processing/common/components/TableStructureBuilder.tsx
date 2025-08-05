import { Button, Stack, Table, TextField } from '@mui/material'
import { Column } from '../../../../types/Table.ts'
import DataTypeSelect from '../../../../shared/components/DataTypeSelect.tsx'
import Iconify from '../../../../shared/components/iconify'
import { TableHeadCustom } from '../../../../shared/components/table'

interface TableStructureBuilderProps {
  columns?: Column[]
  setColumns: (schema: Column[]) => void
}

const defaultColumn = { field: '', headerName: '', flex: 1, align: 'left', headerAlign: 'left' }

export default function TableStructureBuilder({ columns = [], setColumns }: TableStructureBuilderProps) {
  const tableHead = columns.map(({ headerName }) => ({
    id: headerName,
    label: headerName || 'Column Name',
    disabled: !headerName,
  }))

  return (
    <Stack gap={4}>
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
              sx={{ flex: 4 }}
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
        <Stack alignItems="flex-start">
          <Button
            startIcon={<Iconify icon="ic:baseline-add" />}
            onClick={() => setColumns([...columns, defaultColumn])}
            sx={{ cursor: 'pointer' }}
          >
            Add Column
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
