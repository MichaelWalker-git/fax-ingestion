import { Components, CssBaseline, ThemeProvider as MuiThemeProvider, PaletteOptions, createTheme } from '@mui/material'
import { customShadows } from './custom-shadows.ts'
import { componentsOverrides } from './overrides'
import { palette } from './palette.ts'
import { shadows } from './shadows.ts'
import { typography } from './typography.ts'

type Props = {
  children: React.ReactNode
}

export default function ThemeProvider({ children }: Props) {
  const theme = createTheme({
    palette: palette('light') as PaletteOptions,
    shadows: shadows('light'),
    customShadows: customShadows('light'),
    typography,
    shape: { borderRadius: 8 },
  })

  theme.components = componentsOverrides(theme) as Components

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
