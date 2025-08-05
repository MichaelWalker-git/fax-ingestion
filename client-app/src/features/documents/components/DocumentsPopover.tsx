import CustomPopover from '../../../shared/components/custom-popover'
import { Divider, MenuItem } from '@mui/material'
import Iconify from '../../../shared/components/iconify'

interface DocumentsPopoverProps {
  open: HTMLElement | null
  onClose: () => void
  onViewRow: VoidFunction
  onStartProcessing: VoidFunction
  onDeleteRow: VoidFunction
  onConfirm: VoidFunction
}

export default function DocumentsPopover({ open, onClose, onStartProcessing, onConfirm }: DocumentsPopoverProps) {
  return (
    <CustomPopover open={open} onClose={onClose} arrow="right-top" sx={{ width: 160 }}>
      {/*      <MenuItem
        onClick={() => {
          onViewRow()
          onClose()
        }}
      >
        <Iconify icon="ic:description" />
        Get info
      </MenuItem>*/}

      <MenuItem
        onClick={() => {
          onStartProcessing()
          onClose()
        }}
      >
        <Iconify icon="ic:baseline-settings-suggest" />
        Process
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
