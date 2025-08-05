import { debounce, Stack, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import EmailReaderForm from './EmailReaderForm.tsx'
import { GmailFiltersFormValues } from '../../../../../types/Gmail.ts'
import LoadingButton from '@mui/lab/LoadingButton'
import { useCallback, useEffect } from 'react'
import useGmailApi from '../../hooks/useGmailApi.ts'
import EmailMessages from './EmailMessages.tsx'

export default function EmailReader() {
  const form = useForm<GmailFiltersFormValues>({
    mode: 'onBlur',
    defaultValues: { labels: [], from: '', attachmentFormats: [], includeSpam: false, numberToRead: 10 },
  })

  const {
    fetchGmailMessages,
    messages,
    fetchCallbackUrl,
    isCallbackLoading,
    profile,
    signOut,
    isMessagesLoading,
    isSignOutLoading,
    attachments,
    isAttachmentsLoading,
  } = useGmailApi({ form })

  const handleSignIn = () => {
    fetchCallbackUrl()
  }

  const handleSignOut = () => {
    signOut()
  }

  useEffect(() => {
    const subscription = form.watch(() => {
      debouncedSubmit()
    })

    return () => subscription.unsubscribe()
  }, [form])

  const debouncedSubmit = useCallback(
    debounce(() => {
      form.handleSubmit(({ numberToRead, includeSpam, labels, from, attachmentFormats }) => {
        fetchGmailMessages({
          maxResults: `${numberToRead}`,
          includeSpamTrash: `${includeSpam}`,
          labelIds: labels?.join(','),
          query: from && `from:${from}`,
          attachmentFormats: attachmentFormats?.join(','),
        })
      })()
    }, 2000),
    [],
  )

  return (
    <Stack gap={2.5} minWidth="760px">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 0 }}>
            Gmail Reader
          </Typography>
          {profile && (
            <Typography variant="body2" color="textSecondary">
              {profile?.emailAddress}
            </Typography>
          )}
        </Stack>

        {!profile ? (
          <LoadingButton variant="contained" onClick={handleSignIn} loading={isCallbackLoading}>
            Sign In
          </LoadingButton>
        ) : (
          <LoadingButton variant="contained" onClick={handleSignOut} loading={isSignOutLoading}>
            Sign Out
          </LoadingButton>
        )}
      </Stack>
      <Stack direction="row" gap={2}>
        <form style={{ flex: 1 }}>
          <EmailReaderForm form={form} />
        </form>
        <EmailMessages
          messages={messages}
          isMessagesLoading={isMessagesLoading}
          attachments={attachments}
          isAttachmentsLoading={isAttachmentsLoading}
        />
      </Stack>
    </Stack>
  )
}
