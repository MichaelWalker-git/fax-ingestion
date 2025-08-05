import { Box, Drawer, IconButton as MuiIconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useResponsive } from '../../../hooks/useResponsive.ts'
import Scrollbar from '../../scrollbar'
import { NAV } from '../config-layout.ts'
import { navData } from '../utils.tsx'
import { NavSectionVertical } from './nav-section'
import NavToggleButton from './nav-toggle-button.tsx'
import FullLogo from '../FullLogo.tsx'
import AccountPopover from '../header/AccountPopover.tsx'
import useAuthUser from '../../../hooks/useAuthUser.ts'
import { GUIDE_PATH } from '../../../constants/routes.ts'
import SvgColor from '../../svg-color'

type NavigationProps = {
  openNav: boolean
  onCloseNav: VoidFunction
}

export default function Navigation({ openNav, onCloseNav }: NavigationProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { userAttributes } = useAuthUser()

  const lgUp = useResponsive('up', 'lg')

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (openNav) {
      onCloseNav()
    }
  }, [pathname])

  const renderContent = (
    <Stack sx={{ height: '100%', justifyContent: 'space-between' }}>
      <Scrollbar
        sx={{
          height: 1,
          '& .simplebar-content': {
            height: 1,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <FullLogo />
        <NavSectionVertical data={navData} sx={{ mt: 3 }} />
      </Scrollbar>
      <Stack flex={2} direction="row" alignItems="center" gap={2}>
        <AccountPopover />
        <Typography variant="subtitle2" noWrap>
          {`${userAttributes?.given_name || ''} ${userAttributes?.family_name || ''}`}
        </Typography>
        <Tooltip title="Guide">
          <MuiIconButton onClick={() => navigate(GUIDE_PATH)} color="default" size="large">
            <SvgColor src="/assets/icons/header/ic_info.svg" />
          </MuiIconButton>
        </Tooltip>
      </Stack>
    </Stack>
  )

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            p: 2,
            pt: 3,
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  )
}
