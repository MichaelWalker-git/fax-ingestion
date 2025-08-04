// @mui
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { Link as RouterLink } from 'react-router-dom'

import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'

import Iconify from '../../../../iconify'
//
import { NavConfigProps, NavItemProps } from '../types.ts'
import { StyledDotIcon, StyledIcon, StyledItem } from './styles.ts'

// ----------------------------------------------------------------------

type Props = NavItemProps & {
  config: NavConfigProps
}

export default function NavItem({ item, open, depth, active, config, externalLink, ...other }: Props) {
  const { title, path, icon, info, children, disabled, caption, roles } = item

  const subItem = depth !== 1

  const renderContent = (
    <StyledItem disableGutters disabled={disabled} active={active} depth={depth} config={config} {...other}>
      <>
        {icon && <StyledIcon size={config.iconSize}>{icon}</StyledIcon>}

        {subItem && (
          <StyledIcon size={config.iconSize}>
            <StyledDotIcon active={active} />
          </StyledIcon>
        )}
      </>

      {!(config.hiddenLabel && !subItem) && (
        <ListItemText
          primary={title}
          secondary={
            caption ? (
              <Tooltip title={caption} placement="top-start">
                <span>{caption}</span>
              </Tooltip>
            ) : null
          }
          primaryTypographyProps={{
            noWrap: true,
            typography: 'body2',
            textTransform: 'capitalize',
            fontWeight: active ? 'fontWeightSemiBold' : 'fontWeightMedium',
          }}
          secondaryTypographyProps={{
            noWrap: true,
            component: 'span',
            typography: 'caption',
            color: 'text.disabled',
          }}
        />
      )}

      {info && (
        <Box component="span" sx={{ ml: 1, lineHeight: 0 }}>
          {info}
        </Box>
      )}

      {!!children && (
        <Iconify
          width={16}
          icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
          sx={{ ml: 1, flexShrink: 0 }}
        />
      )}
    </StyledItem>
  )

  // Hidden item by role
  if (roles && !roles.includes(`${config.currentRole}`)) {
    return null
  }

  // External link
  if (externalLink)
    return (
      <Link
        href={path}
        target="_blank"
        rel="noopener"
        underline="none"
        color="inherit"
        sx={{
          ...(disabled && {
            cursor: 'default',
          }),
        }}
      >
        {renderContent}
      </Link>
    )

  // Has child
  if (children) {
    return renderContent
  }

  // Default
  return (
    <Link
      component={RouterLink}
      to={path}
      underline="none"
      color="inherit"
      sx={{
        ...(disabled && {
          cursor: 'default',
        }),
      }}
    >
      {renderContent}
    </Link>
  )
}
