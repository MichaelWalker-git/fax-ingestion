import { m } from 'framer-motion';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from '../../../routes/paths.ts';
import useAuthUser from '../../../hooks/useAuthUser.ts';
import CustomPopover, { usePopover } from '../custom-popover';
import { useNavigate } from 'react-router';
import Iconify from '../iconify';
import { useAuth } from '../../../context/AuthContext.tsx';

export default function AccountPopover() {
  const popover = usePopover();
  const navigate = useNavigate();
  const { userAttributes } = useAuthUser();
    const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate(paths.processingResults.root);
  };

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Iconify icon="mdi:account" />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {`${userAttributes?.given_name || ''} ${userAttributes?.family_name || ''}`}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {userAttributes?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleSignOut}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          Logout
        </MenuItem>
      </CustomPopover>
    </>
  );
}
