import { Divider, MenuItem } from '@mui/material';
import Iconify from '../../../../shared/components/iconify';
import CustomPopover from '../../../../shared/components/custom-popover';

interface DocumentsPopoverProps {
  open: HTMLElement | null;
  onClose: () => void;
  onViewRow: VoidFunction;
  onConfirm: VoidFunction;
  onDelete: VoidFunction;
}

export default function ResultsPopover({
  open,
  onClose,
  onViewRow,
  onDelete,
}: DocumentsPopoverProps) {
  return (
    <CustomPopover open={open} onClose={onClose} arrow="right-top" sx={{ width: 260 }}>
      <MenuItem
        onClick={() => {
          onViewRow();
          onClose();
        }}
      >
        <Iconify icon="ic:description" />
        View Processing Result
      </MenuItem>

      <Divider sx={{ borderStyle: 'dashed' }} />
      <MenuItem
        onClick={() => {
          onDelete();
          onClose();
        }}
        sx={{ color: 'error.main' }}
      >
        <Iconify icon="ic:baseline-delete" />
        Delete File
      </MenuItem>
    </CustomPopover>
  );
}
