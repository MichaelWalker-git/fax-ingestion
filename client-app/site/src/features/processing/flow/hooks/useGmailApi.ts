import { useMutation } from 'react-query'
import { GmailFiltersFormValues, RefreshTokenUrlResponse } from '../../../../types/Gmail.ts'
import {
  getGmailAttachments,
  getGmailMessages,
  getGmailProfile,
  getGmailTokenUrl,
  gmailSignOut,
} from '../../../../shared/api/actions/gmail.ts'
import { UseFormReturn } from 'react-hook-form'
import { useEffect } from 'react'

const POPUP_DIMENSIONS = {
  width: 500,
  height: 600,
}

interface UseGmailApiProps {
  form: UseFormReturn<GmailFiltersFormValues, any, undefined>
}

export default function useGmailApi({ form }: UseGmailApiProps) {
  const {
    mutate: fetchGmailAttachments,
    data: attachments,
    isLoading: isAttachmentsLoading,
    reset: resetAttachments,
  } = useMutation(getGmailAttachments)

  const {
    mutate: fetchGmailMessages,
    data: messages,
    isLoading: isMessagesLoading,
    reset: resetMessages,
  } = useMutation(getGmailMessages, {
    onSuccess: (data) => {
      if (data) {
        const messagesWithAttachments = data
          .map((message) =>
            message.attachments && message.attachments.length > 0
              ? { messageId: message.id, attachments: message.attachments, from: message.from }
              : null,
          )
          .filter((message) => message !== null)
        if (messagesWithAttachments.length > 0) {
          fetchGmailAttachments({
            messages: messagesWithAttachments,
          })
        } else {
          resetAttachments()
        }
      }
    },
  })

  const { mutate: fetchGmailProfile, data: profile, reset: resetSignOut } = useMutation(getGmailProfile)
  const { mutate: signOut, isLoading: isSignOutLoading } = useMutation(gmailSignOut, {
    onSuccess: () => {
      form.reset()
      resetSignOut()
      resetMessages()
    },
  })

  const { mutate: fetchCallbackUrl, isLoading: isCallbackLoading } = useMutation<RefreshTokenUrlResponse>(
    getGmailTokenUrl,
    {
      onSuccess: ({ refreshTokenUrl }: RefreshTokenUrlResponse) => {
        if (refreshTokenUrl) {
          const left = window.screenX + (window.outerWidth - POPUP_DIMENSIONS.width) / 2
          const top = window.screenY + (window.outerHeight - POPUP_DIMENSIONS.height) / 2

          const popup = window.open(
            refreshTokenUrl,
            'GmailAuthPopup',
            `width=${POPUP_DIMENSIONS.width},height=${POPUP_DIMENSIONS.height},top=${top},left=${left},resizable,scrollbars=yes,status=1`,
          )

          if (!popup) return

          const timer = setInterval(() => {
            if (popup.closed) {
              clearInterval(timer)
              form.handleSubmit((data) => {
                fetchGmailMessages({
                  maxResults: `${data.numberToRead}`,
                  includeSpamTrash: `${data.includeSpam}`,
                })
                fetchGmailProfile()
              })()
            }
          }, 1000)
        }
      },
    },
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    async function getProfile() {
      await fetchGmailProfile()
      await form.handleSubmit((data) => {
        fetchGmailMessages({
          maxResults: `${data.numberToRead}`,
          includeSpamTrash: `${data.includeSpam}`,
        })
      })()
    }
    getProfile()
  }, [fetchGmailProfile, fetchGmailMessages])

  return {
    fetchGmailMessages,
    messages,
    isMessagesLoading,
    fetchCallbackUrl,
    isCallbackLoading,
    profile,
    signOut,
    isSignOutLoading,
    attachments,
    isAttachmentsLoading,
  }
}
