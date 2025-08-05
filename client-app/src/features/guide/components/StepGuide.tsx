import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import { Alert, Box, Card, CardContent, CardHeader, IconButton as MuiIconButton } from '@mui/material'
import { useState } from 'react'
import DocumentCaptureStepGuide from './DocumentCaptureStepGuide.tsx'
import DocumentExtractionStepGuide from './DocumentExtractionStepGuide.tsx'
import DocumentSummaryStepGuide from './DocumentSummaryStepGuide.tsx'
import StepGuideModal from './StepGuideModal.tsx'

interface StepGuideProps {
  step: number
}

const titles = ['Document Capture', 'Document Extraction', 'Summary']

export default function StepGuide({ step }: StepGuideProps) {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <Box>
      <Card
        variant="elevation"
        sx={{
          mb: 2,
          maxHeight: '460px',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#555',
          },
        }}
      >
        <Alert severity="info" sx={{ position: 'relative' }}>
          Guide for step
          <MuiIconButton
            onClick={() => setModalOpen(true)}
            color="inherit"
            size="large"
            sx={{ position: 'absolute', right: '4px', width: '20px', height: '20px' }}
            aria-label="open guide modal"
          >
            <OpenInFullIcon width="20px" height="20px" sx={{ fontSize: '20px' }} />
          </MuiIconButton>
        </Alert>
        <CardHeader titleTypographyProps={{ variant: 'h6' }} title={titles[step]} sx={{ pb: 0 }} />
        <CardContent>
          {step === 0 && <DocumentCaptureStepGuide />}
          {step === 1 && <DocumentExtractionStepGuide />}
          {step === 2 && <DocumentSummaryStepGuide />}
        </CardContent>
      </Card>
      <StepGuideModal open={modalOpen} step={step} onClose={() => setModalOpen(false)} />
    </Box>
  )
}
