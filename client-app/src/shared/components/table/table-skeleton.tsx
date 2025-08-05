// @mui
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import TableCell from '@mui/material/TableCell';
import TableRow, { TableRowProps } from '@mui/material/TableRow';

// ----------------------------------------------------------------------

export default function TableSkeleton({ ...other }: TableRowProps) {
  return (
    <>
      <TableSkeletonRow {...other} />
      <TableSkeletonRow {...other} />
      <TableSkeletonRow {...other} />
      <TableSkeletonRow {...other} />
      <TableSkeletonRow {...other} />
    </>
  );
}

function TableSkeletonRow({ ...other }: TableRowProps) {
  return (
    <TableRow {...other} sx={{ maxWidth: '90vw' }}>
      <TableCell colSpan={12} sx={{ p: 1 }}>
        <Stack spacing={3} direction="row" alignItems="center">
          <Skeleton sx={{ width: '100%', height: 48 }} />
        </Stack>
      </TableCell>
    </TableRow>
  );
}
