// @mui
import Box, { BoxProps } from '@mui/material/Box'
import { useSettingsContext } from '../../../context/view-settings'
import { useResponsive } from '../../hooks/useResponsive.ts'
import { NAV } from './config-layout.ts'

export default function Main({ children, sx, ...other }: BoxProps) {
  const settings = useSettingsContext()

  const lgUp = useResponsive('up', 'lg')

  const isNavMini = settings.themeLayout === 'mini'

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL}px)`,
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI}px)`,
          }),
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  )
}
