import {Components, createTheme, CssBaseline, PaletteOptions, ThemeProvider as MuiThemeProvider} from '@mui/material';
import { palette } from './palette.ts';
import { shadows } from './shadows.ts';
import { customShadows } from './custom-shadows.ts';
import { typography } from './typography.ts';
import { componentsOverrides } from './overrides';


type Props = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: Props) {

  const theme = createTheme({
    palette: palette('light') as PaletteOptions,
    shadows: shadows('light'),
    customShadows: customShadows('light'),
    typography,
    shape: { borderRadius: 8 },
  });

  theme.components = componentsOverrides(theme) as Components;


  return (
    <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
    </MuiThemeProvider>
  );
}
