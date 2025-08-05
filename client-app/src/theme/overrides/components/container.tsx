import { Components } from '@mui/material';
import { Theme } from '@mui/material/styles';

export default function Container(theme: Theme): Components {
  return {
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: 'none !important',
          padding: theme.spacing(3),
          '@media (min-width: 600px)': {
            padding: theme.spacing(3),
          },
        },
      },
    },
  };
}
