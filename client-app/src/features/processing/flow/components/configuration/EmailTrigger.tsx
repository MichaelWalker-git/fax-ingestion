import { IconButton, Stack, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useForm } from 'react-hook-form'
import { EmailTriggerFormValues } from '../../../../../types/EmailTrigger.ts'
import EmailTriggerForm from './EmailTriggerForm.tsx'
import { useMutation } from 'react-query'
import { emailSesSubscribe } from '../../../../../shared/api/actions/email-ses.ts'
import { use, useEffect, useState } from 'react'
import { SnackbarContext } from '../../../../../context/SnackbarContext.tsx'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import { useCustomNode } from '../../context/CustomNodeContext.tsx'

export default function EmailTrigger() {
  const { putCustomNode, getCustomNode } = useProcessingFlow()

  const { nodeId } = useCustomNode()

  const customNode = getCustomNode(nodeId)

  const form = useForm<EmailTriggerFormValues>({
    mode: 'onBlur',
    defaultValues: { from: '', attachmentFormats: [] },
  })

  const { setSnackbar } = use(SnackbarContext)

  const { mutate: subscribeSes } = useMutation(emailSesSubscribe, {
    onError: (error) => {
      console.error('Error subscribing to ses:', error)
      setSnackbar({ text: 'Error subscribing to ses:', severity: 'error' })
    },
  })

  const [sesEmail, setSesEmail] = useState<string>('')

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (customNode) {
        putCustomNode({
          ...customNode,
          trigger: {
            from: values.from!,
            attachmentFormats: values.attachmentFormats,
          },
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [form, customNode, putCustomNode])

  useEffect(() => {
    subscribeSes(undefined, {
      onSuccess: (data) => {
        setSesEmail(data.email)
      },
    })
  }, [subscribeSes])

  return (
    <Stack gap={2.5}>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 0 }}>
        Email Trigger
      </Typography>
      <Stack direction="row" gap={2}>
        <Stack width="100%" gap={2}>
          <Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>{sesEmail}</Typography>
              {sesEmail && (
                <IconButton
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(sesEmail)
                    setSnackbar({ text: 'Email copied to clipboard', severity: 'success' })
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              All emails sent to this address will be automatically processed by the system
            </Typography>
          </Stack>
          <form style={{ flex: 1 }}>
            <EmailTriggerForm form={form} />
          </form>
        </Stack>
      </Stack>
    </Stack>
  )
}
