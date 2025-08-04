import { Theme } from '@mui/material/styles';
//
import { menuItem } from '../../css.ts';

// ----------------------------------------------------------------------

export default function Menu(theme: Theme) {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          ...menuItem(theme),
        },
      },
    },
  };
}
