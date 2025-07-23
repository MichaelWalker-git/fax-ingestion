import { Alert, Snackbar as MuiSnackbar } from '@mui/material'
import Fade from '@mui/material/Fade'

interface SuccessSnackbarProps {
  open: boolean
  handleClose?: () => void
  text?: string
  severity?: 'success' | 'error'
  variant?: 'filled' | 'standard' | 'outlined'
}

export default function SnackbarAlert({ open, handleClose, text, severity, variant = 'filled' }: SuccessSnackbarProps) {
  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={Fade}
      sx={{ position: 'relative' }}
    >
      <Alert onClose={handleClose} severity={severity} variant={variant} sx={{ width: '100%' }}>
        {text || 'Success'}
      </Alert>
    </MuiSnackbar>
  )
}
