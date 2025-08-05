import { Box, Button, CardContent, CardHeader, Modal, Typography } from '@mui/material'
import DocumentCaptureStepGuide from './DocumentCaptureStepGuide.tsx'
import DocumentExtractionStepGuide from './DocumentExtractionStepGuide.tsx'
import DocumentSummaryStepGuide from './DocumentSummaryStepGuide.tsx'

const titles = ['Document Capture', 'Document Extraction', 'Summary']

interface StepGuideModalProps {
  open: boolean
  onClose: () => void
  step: number
}

export default function StepGuideModal({ open, onClose, step }: StepGuideModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{ bgcolor: 'background.paper', border: '1px solid #000', p: 4 }}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Step Guide
        </Typography>
        <Box
          sx={{
            mb: 2,
          }}
        >
          <CardHeader title={titles[step]} sx={{ pb: 0 }} />
          <CardContent>
            {step === 0 && <DocumentCaptureStepGuide />}
            {step === 1 && <DocumentExtractionStepGuide />}
            {step === 2 && <DocumentSummaryStepGuide />}
          </CardContent>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
        </Box>
      </Box>
    </Modal>
  )
}
