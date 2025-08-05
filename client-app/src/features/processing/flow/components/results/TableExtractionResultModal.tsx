import { Button, Modal, Paper, Stack, Typography } from '@mui/material'
import TableExtractionModalResultBlock from './TableExtractionModalResultBlock.tsx'
import { useResultPresignedUrls } from '../../../common/hooks/useResultPresignedUrls.ts'
import CircularLoader from '../../../../../shared/components/loader/CircularLoader.tsx'
import { ProcessingResult } from '../../../../../types/ProcessingResults.ts'

interface TableExtractionResultModalProps {
  open: boolean
  onClose: () => void
  processingDocumentResults: ProcessingResult[]
}

export default function TableExtractionResultModal({
  open,
  onClose,
  processingDocumentResults,
}: TableExtractionResultModalProps) {
  const { presignedUrlsMap, loadingPresigned } = useResultPresignedUrls({ processingDocumentResults })

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper>
        <Stack sx={{ maxHeight: '90vh', width: '50vw', p: 2.5 }}>
          <Typography variant="h6" mb={2.5}>
            Column configuration
          </Typography>
          <Stack sx={{ flexGrow: 1, overflow: 'auto', gap: 4 }}>
            {loadingPresigned && <CircularLoader text="Loading results" />}
            {processingDocumentResults.map((documentResult) => (
              <TableExtractionModalResultBlock
                key={documentResult.sortKey}
                processingDocument={documentResult}
                presignedUrl={presignedUrlsMap.get(documentResult.filename)?.getUrl}
              />
            ))}
          </Stack>
          <Stack py={4} alignItems="end">
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  )
}
