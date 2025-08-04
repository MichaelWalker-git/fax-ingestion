import { Button } from '@mui/material'
import Iconify from '../iconify'
import { useNavigate } from 'react-router-dom'

export default function BackButton() {
  const navigate = useNavigate()
  return (
    <Button
      sx={{ height: 'fit-content', p: 1 }}
      startIcon={<Iconify icon="ic:baseline-arrow-back" />}
      onClick={() => navigate(-1)}
    >
      Back
    </Button>
  )
}
