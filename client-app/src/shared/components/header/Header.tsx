import Stack from '@mui/material/Stack';
import AccountPopover from '../account-popover/AccountPopover.tsx';

export default function Header() {
  return (
    <Stack sx={{ position: 'sticky', width: '100%' }} justifyContent="end" direction="row">
      <AccountPopover />
    </Stack>
  );
}
