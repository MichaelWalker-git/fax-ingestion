import { Box } from '@mui/material'
import Link from '@mui/material/Link'
import { Link as RouterLink } from 'react-router-dom'
import logo from '../../../assets/logo.png'

export default function Logo() {
  return (
    <Box sx={{ width: 'fit-content', alignSelf: 'center' }}>
      <Link component={RouterLink} to="/" sx={{ display: 'contents' }}>
        <img src={logo} alt="Your Logo" />
      </Link>
    </Box>
  )
}
