import { Stack } from '@mui/material'
import CompaniesList from './CompaniesList.tsx'

export default function SystemAdmin() {
  return (
    <Stack gap={2}>
      <CompaniesList />
    </Stack>
  )
}
