import { Button } from '@mui/material'
import Iconify from '../../../../../shared/components/iconify'
import { useBoolean } from '../../../../../shared/hooks/useBoolean.ts'
import SendResultToEmailModal from '../../../flow/components/results/SendResultToEmailModal.tsx'

interface SendEmailButtonProps {
  nodeId: string
  outputFileNames: { [key: string]: string }
}

export default function SendEmailButton({ nodeId, outputFileNames }: SendEmailButtonProps) {
  const sendEmailModal = useBoolean(false)

  return (
    <>
      <Button startIcon={<Iconify icon="ic:baseline-file-download" />} onClick={sendEmailModal.onTrue}>
        Send Email
      </Button>
      {sendEmailModal.value && (
        <SendResultToEmailModal
          open={sendEmailModal.value}
          onClose={sendEmailModal.onFalse}
          nodeId={nodeId}
          outputFileNames={outputFileNames}
        />
      )}
    </>
  )
}
