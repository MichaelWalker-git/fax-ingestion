import { Box, IconButton } from '@mui/material'
import { useSettingsContext } from '../../../context/view-settings'
import { useBoolean } from '../../hooks/useBoolean.ts'
import { useResponsive } from '../../hooks/useResponsive.ts'
import RouterContainer from './RouterContainer.tsx'
import Main from './main.tsx'
import NavigationMini from './navigation/navigation-mini.tsx'
import Navigation from './navigation/navigation.tsx'
import SvgColor from '../svg-color'

export function Layout() {
  const settings = useSettingsContext()

  const lgUp = useResponsive('up', 'lg')

  const isMini = settings.themeLayout === 'mini'

  const nav = useBoolean()

  return (
    <Box sx={{ height: '100%' }}>
      {!lgUp && (
        <IconButton onClick={nav.onTrue}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}
      <Box
        sx={{
          display: { lg: 'flex' },
          minHeight: { lg: 1 },
        }}
      >
        {isMini && lgUp ? <NavigationMini /> : <Navigation openNav={nav.value} onCloseNav={nav.onFalse} />}
        <Main>
          <RouterContainer />
        </Main>
      </Box>
    </Box>
  )
}
