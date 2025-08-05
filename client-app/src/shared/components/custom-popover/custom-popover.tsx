// @mui
import { menuItemClasses } from '@mui/material/MenuItem';
import Popover, { PopoverOrigin } from '@mui/material/Popover';
//
import { getPosition } from './utils.ts';
import { StyledArrow } from './styles.tsx';
import { MenuPopoverProps } from './types.ts';

// ----------------------------------------------------------------------

export default function CustomPopover({
  open,
  children,
  arrow = 'top-right',
  hiddenArrow,
  sx,
  ...other
}: MenuPopoverProps) {
  const { style, anchorOrigin, transformOrigin } = getPosition(arrow);

  return (
    <Popover
      open={Boolean(open)}
      anchorEl={open}
      anchorOrigin={anchorOrigin as PopoverOrigin}
      transformOrigin={transformOrigin as PopoverOrigin}
      PaperProps={{
        sx: {
          width: 'auto',
          overflow: 'inherit',
          ...style,
          [`& .${menuItemClasses.root}`]: {
            '& svg': {
              mr: 2,
              flexShrink: 0,
            },
          },
          ...sx,
        },
      }}
      {...other}
    >
      {!hiddenArrow && <StyledArrow arrow={arrow} />}

      {children}
    </Popover>
  );
}
