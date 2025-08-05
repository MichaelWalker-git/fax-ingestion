// @mui
import { Theme, SxProps } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
//
import EmptyContent from '../empty-content';

// ----------------------------------------------------------------------

type Props = {
  imgUrl?: string;
  notFound: boolean;
  sx?: SxProps<Theme>;
  title?: string;
  description?: string;
};

export default function TableNoData({
  notFound,
  sx,
  imgUrl,
  title = 'No Data',
  description,
}: Props) {
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={12}>
          <EmptyContent
            filled
            title={title}
            description={description}
            imgUrl={imgUrl}
            sx={{
              py: 10,
              ...sx,
            }}
          />
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
