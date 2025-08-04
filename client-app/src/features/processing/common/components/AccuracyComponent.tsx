import { Box } from '@mui/material'

interface AccuracyComponentProps {
  accuracy: string
  text?: string
}

export default function AccuracyComponent({ accuracy, text }: AccuracyComponentProps) {
  const getColor = (accuracy: string) => {
    if (Number(accuracy) >= 80) {
      return 'success.main'
    }
    if (Number(accuracy) >= 50) {
      return 'warning.main'
    }

    return 'error.main'
  }

  return (
    <Box display="flex" gap={0.5} height="auto" sx={{ fontSize: '14px', padding: '4px', height: 'fit-content' }}>
      {text}
      <Box sx={{ borderRadius: '8px', border: '1px solid', px: 1, ml: 1 }} color={getColor(accuracy)}>
        {accuracy}%
      </Box>
    </Box>
  )
}
