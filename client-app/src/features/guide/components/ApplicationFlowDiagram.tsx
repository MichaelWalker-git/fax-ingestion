import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

export default function ApplicationFlowDiagram() {
  return (
    <Box
      sx={{
        backgroundColor: '#f9f9f9',
        p: 2,
        borderRadius: 2,
        maxWidth: 700,
        mx: 'auto',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        <Card
          variant="outlined"
          sx={{
            width: 190,
            textAlign: 'center',
            borderColor: '#ccc',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Step 1
            </Typography>
            <Typography variant="body2">Document Capture</Typography>
          </CardContent>
        </Card>

        <ArrowForwardIcon sx={{ color: '#777', fontSize: 32 }} />

        <Card
          variant="outlined"
          sx={{
            width: 210,
            textAlign: 'center',
            borderColor: '#ccc',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Step 2
            </Typography>
            <Typography variant="body2">Document Extraction</Typography>
          </CardContent>
        </Card>

        <ArrowForwardIcon sx={{ color: '#777', fontSize: 32 }} />

        <Card
          variant="outlined"
          sx={{
            width: 140,
            textAlign: 'center',
            borderColor: '#ccc',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Step 3
            </Typography>
            <Typography variant="body2">Summary</Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  )
}
