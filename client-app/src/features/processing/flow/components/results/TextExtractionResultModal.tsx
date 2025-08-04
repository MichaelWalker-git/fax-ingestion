import { Button, Modal, Paper, Stack, Typography } from '@mui/material'
import TextExtractionNodeResult from './TextExtractionResult.tsx'
import { useResultPresignedUrls } from '../../../common/hooks/useResultPresignedUrls.ts'
import CircularLoader from '../../../../../shared/components/loader/CircularLoader.tsx'
import { ProcessingResult } from '../../../../../types/ProcessingResults.ts'

interface TextExtractionResultModalProps {
  open: boolean
  handleClose: () => void
  processingDocumentResults: ProcessingResult[]
}

export default function TextExtractionResultModal({
  open,
  handleClose,
  processingDocumentResults,
}: TextExtractionResultModalProps) {
  const { presignedUrlsMap, loadingPresigned } = useResultPresignedUrls({ processingDocumentResults })

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper>
        <Stack sx={{ maxHeight: '90vh', width: '50vw', p: 2.5 }}>
          <Typography variant="h6" mb={2.5}>
            Text Configuration
          </Typography>
          <Stack sx={{ flexGrow: 1, overflow: 'auto', gap: 4 }}>
            {loadingPresigned && <CircularLoader text="Loading results" />}
            {!loadingPresigned &&
              processingDocumentResults.map((documentResult) => (
                <TextExtractionNodeResult
                  key={documentResult.sortKey}
                  processingDocument={documentResult}
                  presignedUrl={presignedUrlsMap.get(documentResult.filename)?.getUrl}
                />
              ))}
          </Stack>
          <Stack p={4} alignItems="end">
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  )
}
