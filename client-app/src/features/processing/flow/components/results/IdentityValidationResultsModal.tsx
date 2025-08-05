import { Button, Modal, Paper, Stack, Typography } from '@mui/material'
import { IDocumentType } from '../../../../../types/DocumentType.ts'
import { useResultPresignedUrls } from '../../../common/hooks/useResultPresignedUrls.ts'
import CircularLoader from '../../../../../shared/components/loader/CircularLoader.tsx'
import IdentityValidationResultBlock from './IdentityValidationResultBlock.tsx'

interface IdentityValidationResultsModalProps {
  open: boolean
  onClose: () => void
  processingDocumentResults: IDocumentType[]
}

export default function IdentityValidationResultsModal({
  open,
  onClose,
  processingDocumentResults,
}: IdentityValidationResultsModalProps) {
  const { loadingPresigned, presignedUrlsMap } = useResultPresignedUrls({ processingDocumentResults })

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
            Validation results
          </Typography>
          <Stack sx={{ flexGrow: 1, overflow: 'auto', gap: 1 }}>
            {loadingPresigned && <CircularLoader text="Loading results" />}
            {!loadingPresigned &&
              processingDocumentResults.map((processingDocumentResult) => {
                return (
                  <IdentityValidationResultBlock
                    key={processingDocumentResult.sortKey}
                    processingDocument={processingDocumentResult}
                    presignedUrl={presignedUrlsMap.get(processingDocumentResult.filename)?.getUrl}
                  />
                )
              })}
          </Stack>
          <Stack p={4} alignItems="end">
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  )
}
