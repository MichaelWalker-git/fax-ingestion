import CustomPopover from '../../../../../../shared/components/custom-popover'
import { Divider, MenuItem } from '@mui/material'
import Iconify from '../../../../../../shared/components/iconify'

interface DocumentsPopoverProps {
  open: HTMLElement | null
  onClose: () => void
  onOpenRow: VoidFunction
  onConfirm: VoidFunction
}

export default function TriggerRowPopover({ open, onClose, onOpenRow, onConfirm }: DocumentsPopoverProps) {
  return (
    <CustomPopover open={open} onClose={onClose} arrow="right-top" sx={{ width: 160 }}>
      <MenuItem
        onClick={() => {
          onOpenRow()
          onClose()
        }}
      >
        <Iconify icon="ic:baseline-settings-suggest" />
        Open
      </MenuItem>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <MenuItem
        onClick={() => {
          onConfirm()
          onClose()
        }}
        sx={{ color: 'error.main' }}
      >
        <Iconify icon="ic:delete" />
        Delete
      </MenuItem>
    </CustomPopover>
  )
}
