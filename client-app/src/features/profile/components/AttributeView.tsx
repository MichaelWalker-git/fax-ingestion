import { Box, Typography } from '@mui/material'

interface ProfileAttributeViewProps {
  label: string
  value: string
}

export default function AttributeView({ label, value }: ProfileAttributeViewProps) {
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      px={1.5}
      pt="7px"
      pb="6px"
      sx={{ borderBottom: '1px solid #ccc' }}
    >
      <Typography fontSize="12px" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ minHeight: '24px' }}>
        {value}
      </Typography>
    </Box>
  )
}
