import { Box, Button, CircularProgress, IconButton, Modal, Paper, Stack, Typography } from '@mui/material'
import { TextEditor } from '../../../../../shared/components/text-editor/TextEditor.tsx'
import { useForm } from 'react-hook-form'
import FilledTextInput from '../../../../../shared/components/filled-text-input/FilledTextInput.tsx'
import { useMutation } from 'react-query'
import { sendGmailMessage } from '../../../../../shared/api/actions/gmail.ts'
import { useContext, useEffect, useMemo, useState } from 'react'
import { SnackbarContext } from '../../../../../context/SnackbarContext.tsx'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import { GmailSendMessageRequestAttachment } from '../../../../../types/Gmail.ts'
import Iconify from '../../../../../shared/components/iconify'
import { useUploadFiles } from '../../../../../shared/hooks/useUploadFiles.ts'

interface SendResultToEmailModalProps {
  open: boolean
  onClose: () => void
  nodeId: string
  outputFileNames: { [key: string]: string }
}

interface EmailResult {
  recipient: string
  subject: string
  body: string
}

export default function SendResultToEmailModal({
  open,
  onClose,
  nodeId,
  outputFileNames,
}: SendResultToEmailModalProps) {
  const { uploading, uploadProgress, handleUpload, cancelUpload, isFileUploading } = useUploadFiles()

  const { processingResults } = useProcessingFlow()

  const filteredProcessingResults = useMemo(() => {
    return processingResults?.filter((result) => result.taskId === nodeId) || []
  }, [processingResults, nodeId])

  const [attachments, setAttachments] = useState<GmailSendMessageRequestAttachment[]>([])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const convertedAttachments = filteredProcessingResults.map((result) => ({
      attachmentFilename: outputFileNames[result.filename],
      fileId: result.fileId!,
      attachResultFile: true,
      attachFile: false,
    }))
    setAttachments(convertedAttachments)
  }, filteredProcessingResults)

  const { setSnackbar } = useContext(SnackbarContext)

  const { mutate: sendEmail } = useMutation(sendGmailMessage, {
    onSuccess: () => {
      setSnackbar({ text: 'Email sent successfully', severity: 'success' })
    },
    onError: (error) => {
      console.error('Error  sending email:', error)
      setSnackbar({ text: 'Error  sending email:', severity: 'error' })
    },
  })

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isValid },
  } = useForm<EmailResult>({
    mode: 'onBlur',
    defaultValues: { recipient: '', subject: '', body: '' },
  })

  const onSubmit = (data: EmailResult) => {
    sendEmail({
      to: data.recipient,
      subject: data.subject,
      body: data.body,
      attachments: attachments,
    })
    onClose()
  }

  useEffect(() => {
    setAttachments((prevState) =>
      prevState.map((attachment) => ({
        ...attachment,
        fileId: uploadProgress[attachment.attachmentFilename]?.fileId || attachment.fileId,
      })),
    )
  }, [uploadProgress])

  const handleAttach = (files: FileList) => {
    const newAttachments = Object.values(Array.from(files)).map((file) => ({
      attachmentFilename: file.name || '',
      attachResultFile: false,
      attachFile: true,
    }))

    setAttachments((prevState) => [...prevState, ...newAttachments])

    handleUpload(Array.from(files))
  }

  const handleAttachmentRemove = (attachment: GmailSendMessageRequestAttachment) => {
    setAttachments((prev) => prev?.filter((a) => a.fileId !== attachment.fileId))
    if (uploadProgress[attachment.attachmentFilename]) {
      cancelUpload(attachment.attachmentFilename, attachment.fileId!)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper>
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <Stack sx={{ maxHeight: '90vh', width: '50vw', p: 2.5 }}>
            <Typography variant="h6" mb={2.5}>
              Send Email
            </Typography>
            <Box sx={{ bgcolor: 'background.neutral', p: 1, borderRadius: 1 }}>
              <Stack
                sx={{ flexGrow: 1, overflow: 'auto', gap: 1, bgcolor: 'background.paper', p: 2, position: 'relative' }}
              >
                <FilledTextInput
                  placeholder="Recipient"
                  register={register}
                  name="recipient"
                  rules={{
                    required: 'Recipient is required',
                    maxLength: { value: 254, message: 'Max length is 254 characters' },
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  }}
                  error={!!errors.recipient}
                  helperText={errors.recipient?.message}
                />
                <FilledTextInput
                  placeholder="Subject"
                  register={register}
                  name="subject"
                  rules={{
                    maxLength: { value: 254, message: 'Max length is 254 characters' },
                  }}
                  error={!!errors.subject}
                  helperText={errors.subject?.message}
                />
                <TextEditor
                  placeholder="Body"
                  onChange={(html) => setValue('body', html)}
                  inputStyle={{ minHeight: 500 }}
                  onAttach={handleAttach}
                />
                <Stack sx={{ position: 'absolute', bottom: 80, bgcolor: 'background.neutral', width: '70%' }}>
                  {attachments?.map((attachment) => (
                    <Stack
                      key={attachment.attachmentFilename}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ bgcolor: 'background.neutral', py: 0.5, px: 1 }}
                    >
                      <Typography variant="body1" fontWeight="500" color="info.dark">
                        {attachment.attachmentFilename}
                      </Typography>
                      {isFileUploading(attachment.attachmentFilename) && <CircularProgress color="inherit" size={16} />}
                      {!isFileUploading(attachment.attachmentFilename) && (
                        <IconButton onClick={() => handleAttachmentRemove(attachment)}>
                          <Iconify icon="mingcute:close-line" />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Box>
            <Stack pt={4} pb={2} alignItems="end">
              <Stack direction="row" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit" disabled={uploading || !isValid}>
                  Send
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Modal>
  )
}
