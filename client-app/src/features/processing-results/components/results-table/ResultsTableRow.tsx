import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { CircularProgress, IconButton, Typography } from '@mui/material';
import { formatDate } from '../../../../utils/date.ts';
import Label from '../../../../shared/components/label';

import Iconify from '../../../../shared/components/iconify';
import { usePopover } from '../../../../shared/components/custom-popover';

import { IDocument } from '../../../../types/IDocument.ts';
import { FILE_STATUSES } from '../../constants/files.ts';
import { useBoolean } from '../../../../hooks/use-boolean.ts';
import ResultsPopover from './ResultsPopover.tsx';
import { REVIEW_STATUSES } from '../../../../constants/review.ts';
import Tooltip from '@mui/material/Tooltip';

type DocumentsTableRowProps = {
  row: IDocument;
  onViewRow: (rowId: string) => void;
  onDelete: (id: string) => void;
  documentToDelete?: string;
};

export default function ResultsTableRow({
  row,
  onViewRow,
  onDelete,
  documentToDelete,
}: DocumentsTableRowProps) {
  const { filename, status, updatedAt, patientFirstName, patientLastName, createdAt } = row;

  const popover = usePopover();

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ cursor: 'pointer' }} onClick={() => onViewRow(row.sortKey)}>
          <Typography variant="subtitle2">{filename}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{patientFirstName}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{patientLastName}</Typography>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === FILE_STATUSES.UPLOADED && 'success') ||
              (status === FILE_STATUSES.PROCESSED && 'info') ||
              (status === FILE_STATUSES.INITIALIZED && 'warning') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell>

        <TableCell sx={{ verticalAlign: 'middle' }}>
          <Label
            variant="soft"
            color={
              (row.reviewStatus === REVIEW_STATUSES.APPROVED && 'success') ||
              (row.reviewStatus === REVIEW_STATUSES.REJECTED && 'error') ||
              'default'
            }
          >
            {row.reviewStatus || REVIEW_STATUSES.NOT_REVIEWED}
          </Label>
        </TableCell>

        <TableCell sx={{ verticalAlign: 'middle', maxWidth: 300 }}>
          <Tooltip title={row.reviewComment || ''}>
            <Typography
              noWrap
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {row.reviewComment}
            </Typography>
          </Tooltip>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{updatedAt && formatDate(updatedAt)}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{createdAt && formatDate(createdAt)}</Typography>
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          {documentToDelete === row.sortKey ? (
            <CircularProgress sx={{ width: '22px !important', height: '22px !important' }} />
          ) : (
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <ResultsPopover
        open={popover.open}
        onClose={popover.onClose}
        onViewRow={() => onViewRow(row.sortKey)}
        onConfirm={confirm.onTrue}
        onDelete={() => onDelete(row.sortKey)}
      />
    </>
  );
}
