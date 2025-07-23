import { m, MotionProps } from 'framer-motion'
// @mui
import Box, { BoxProps } from '@mui/material/Box'
// hooks

//
import { varContainer } from './variants'
import { useResponsive } from '../../hooks/useResponsive.ts'

// ----------------------------------------------------------------------

type IProps = BoxProps & MotionProps

interface Props extends IProps {
  children: React.ReactNode
  disableAnimatedMobile?: boolean
}

export default function MotionViewport({ children, disableAnimatedMobile = true, ...other }: Props) {
  const smDown = useResponsive('down', 'sm')

  if (smDown && disableAnimatedMobile) {
    return <Box {...other}>{children}</Box>
  }

  return (
    <Box
      component={m.div}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.3 }}
      variants={varContainer()}
      {...other}
    >
      {children}
    </Box>
  )
}
