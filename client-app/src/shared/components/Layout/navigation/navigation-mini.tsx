// @mui
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { hideScroll } from '../../../../theme/css.ts'
import Logo from '../Logo.tsx'
//
import { NAV } from '../config-layout.ts'
import { navData } from '../utils.tsx'
import { NavSectionMini } from './nav-section'
import NavToggleButton from './nav-toggle-button.tsx'
import AccountPopover from '../header/AccountPopover.tsx'
import { IconButton as MuiIconButton, Tooltip } from '@mui/material'
import { GUIDE_PATH } from '../../../constants/routes.ts'
import SvgColor from '../../svg-color'
import { useNavigate } from 'react-router-dom'

// ----------------------------------------------------------------------

export default function NavigationMini() {
  const navigate = useNavigate()
  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_MINI },
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_MINI - 12,
        }}
      />
      <Stack
        sx={{
          gap: 2,
          p: 2,
          pt: 3,
          position: 'fixed',
          width: NAV.W_MINI,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...hideScroll.x,
          height: '100vh',
          justifyContent: 'space-between',
        }}
      >
        <Logo />
        <NavSectionMini data={navData} />
        <Stack flex={2} direction="column" alignItems="center" gap={2} justifyContent="flex-end">
          <Tooltip title="Guide">
            <MuiIconButton onClick={() => navigate(GUIDE_PATH)} color="default" size="large">
              <SvgColor src="/assets/icons/header/ic_info.svg" />
            </MuiIconButton>
          </Tooltip>
          <AccountPopover />
        </Stack>
      </Stack>
    </Box>
  )
}
