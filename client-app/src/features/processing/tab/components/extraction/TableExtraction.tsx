import { Divider, Stack, Typography } from '@mui/material'
import TableStructureBuilder from '../../../common/components/TableStructureBuilder.tsx'
import { use } from 'react'
import { ProcessingContext } from '../../context/ProcessingContext.tsx'

export default function TableExtraction() {
  const { setTableSchema, tableSchema } = use(ProcessingContext)
  return (
    <Stack gap={3}>
      <Typography variant="caption">
        Choose how to extract table data. Define the structure manually or let the system detect it automatically.
      </Typography>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <Stack gap={1}>
        <Typography variant="subtitle2">Column Configuration</Typography>
        <Typography variant="caption" color="textDisabled">
          Set column names and data types for accurate extraction. Use predefined structures, create custom ones, or
          apply templates for consistency.
        </Typography>
      </Stack>
      <TableStructureBuilder columns={tableSchema} setColumns={setTableSchema} />
    </Stack>
  )
}
