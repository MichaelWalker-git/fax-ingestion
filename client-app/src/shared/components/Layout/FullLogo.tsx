import { Box, Typography } from '@mui/material'
import Logo from './Logo.tsx'

export default function FullLogo() {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Logo />
      <Typography variant="h6">EzPaperwork</Typography>
    </Box>
  )
}
