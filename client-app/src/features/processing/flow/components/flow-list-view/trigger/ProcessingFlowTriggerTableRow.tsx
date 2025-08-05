import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { Button, IconButton, Typography } from '@mui/material'
import { ConfirmDialog } from '../../../../../../shared/components/custom-dialog'
import TriggerRowPopover from './TriggerRowPopover.tsx'
import Iconify from '../../../../../../shared/components/iconify'
import { formatDate } from '../../../../../../utils/date.ts'
import { usePopover } from '../../../../../../shared/components/custom-popover'
import { useBoolean } from '../../../../../../shared/hooks/useBoolean.ts'
import Switch from '@mui/material/Switch'
import { EmailTrigger } from '../../../../../../types/EmailTrigger.ts'

type ProcessingFlowTriggerTableRowProps = {
  row: EmailTrigger
  onOpenRow: () => void
  onDeleteRow: (rowId: string) => void
  onChangeStatus: (rowId: string) => void
}

export default function ProcessingFlowTriggerTableRow({
  row,
  onOpenRow,
  onDeleteRow,
  onChangeStatus,
}: ProcessingFlowTriggerTableRowProps) {
  const popover = usePopover()

  const confirm = useBoolean()

  if (!row) {
    return null
  }

  const { updatedAt, active, templateId, from, name } = row

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={onOpenRow}>
          <Typography variant="subtitle2">{name}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{from}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{updatedAt && formatDate(updatedAt)}</Typography>
        </TableCell>

        <TableCell>
          <Switch checked={active} onChange={() => onChangeStatus(templateId)} />
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>
      <TriggerRowPopover
        open={popover.open}
        onClose={popover.onClose}
        onOpenRow={onOpenRow}
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
              onDeleteRow(templateId)
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
