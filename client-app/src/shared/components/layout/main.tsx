// @mui
import Box, { BoxProps } from '@mui/material/Box';

import { useResponsive } from '../../../hooks/use-responsive.ts';

// ----------------------------------------------------------------------

const SPACING = 6;

export default function Main({ children, sx, ...other }: BoxProps) {
  const lgUp = useResponsive('up', 'lg');

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: `${SPACING}px`,
        ...(lgUp && {
          px: 2,
          width: '100%',
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}
