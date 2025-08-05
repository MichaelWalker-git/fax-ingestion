// @mui
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import TableCell from '@mui/material/TableCell'
import TableRow, { TableRowProps } from '@mui/material/TableRow'

// ----------------------------------------------------------------------

export default function TableSkeleton({ ...other }: TableRowProps) {
  return (
    <TableRow {...other}>
      <TableCell colSpan={12}>
        <Stack spacing={7} direction="row" alignItems="center">
          <Skeleton sx={{ width: 30, height: 40 }} />
          <Skeleton sx={{ width: 280, height: 40 }} />
          <Skeleton sx={{ width: 250, height: 40 }} />
          <Skeleton sx={{ width: 250, height: 40 }} />
          <Skeleton sx={{ width: 250, height: 40 }} />
        </Stack>
      </TableCell>
    </TableRow>
  )
}
