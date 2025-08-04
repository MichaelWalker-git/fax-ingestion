import { IDocumentType } from '../../../../types/DocumentType.ts'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Checkbox from '@mui/material/Checkbox'
import { Button, CircularProgress, IconButton, Typography } from '@mui/material'
import { formatDate } from '../../../../utils/date.ts'
import Label from '../../../../shared/components/label'
import { FILE_STATUSES } from '../../../../shared/constants/file-constants.ts'
import Iconify from '../../../../shared/components/iconify'
import { usePopover } from '../../../../shared/components/custom-popover'
import { ConfirmDialog } from '../../../../shared/components/custom-dialog'
import { useBoolean } from '../../../../shared/hooks/useBoolean.ts'
import DocumentsPopover from '../DocumentsPopover.tsx'
import FileLabel from '../../../../shared/components/file-label/FileLabel.tsx'

type DocumentsTableRowProps = {
  row: IDocumentType
  selected: boolean
  onSelectRow: VoidFunction
  onViewRow: (rowId: string) => void
  onStartProcessing: (rowId: string) => void
  onDeleteRow: (rowId: string) => void
  deletingRows: string[]
}

export default function DocumentsTableRow({
  row,
  onStartProcessing,
  onSelectRow,
  onViewRow,
  onDeleteRow,
  selected,
  deletingRows,
}: DocumentsTableRowProps) {
  const { filename, status, updatedAt } = row

  const popover = usePopover()

  const confirm = useBoolean()

  const isDeleting = deletingRows.includes(row.sortKey)

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell
          sx={{ cursor: 'pointer' }}
          onClick={() => row.status !== FILE_STATUSES.INITIALIZED && onStartProcessing(row.sortKey)}
        >
          <Typography variant="subtitle2">{filename}</Typography>
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
          <FileLabel filename={filename} />
        </TableCell>

        <TableCell>
          <Typography variant="body2">{updatedAt && formatDate(updatedAt)}</Typography>
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          {isDeleting ? (
            <CircularProgress sx={{ width: '22px !important', height: '22px !important' }} />
          ) : (
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <DocumentsPopover
        open={popover.open}
        onClose={popover.onClose}
        onDeleteRow={() => onDeleteRow(row.sortKey)}
        onViewRow={() => onViewRow(row.sortKey)}
        onStartProcessing={() => onStartProcessing(row.sortKey)}
        onConfirm={confirm.onTrue}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow(row.sortKey)
              confirm.onFalse()
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  )
}
