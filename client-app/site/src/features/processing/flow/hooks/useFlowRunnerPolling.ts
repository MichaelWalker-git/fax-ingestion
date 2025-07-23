import usePolling from '../../../../shared/hooks/usePolling.ts'
import { get } from 'aws-amplify/api'
import { API_NAME, API_PATH_TEMPLATE_FILES } from '../../../../shared/api/paths.ts'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import { filterProcessingResult } from '../../common/helpers/processing-results.ts'
import { FILE_STATUSES } from '../../../../shared/constants/file-constants.ts'
import { useRef, useState } from 'react'
import { getSesEmailMessages } from '../../../../shared/api/actions/email-ses.ts'
import { useProcessingFlow } from '../context/ProcessingFlowContext.tsx'

export const TEMPLATE_TYPES = {
  SIMPLE_TEMPLATE: 'SIMPLE_TEMPLATE',
  SES_TEMPLATE: 'SES_TEMPLATE',
}

type TemplateType = (typeof TEMPLATE_TYPES)[keyof typeof TEMPLATE_TYPES]

export function useFlowRunnerPolling() {
  const { setProcessingResults, setIsRunning, setEmailTriggerResults } = useProcessingFlow()

  const [flowDetails, setFlowDetails] = useState<{
    templateId?: string | undefined
    templateType?: TemplateType
    triggerOptions?: { from?: string | undefined }
    interval?: number | undefined
  }>()
  const startTimeRef = useRef<number | null>(null)

  usePolling({
    apiCall: async () => {
      switch (flowDetails?.templateType) {
        case TEMPLATE_TYPES.SIMPLE_TEMPLATE:
          return getSimpleTemplateResults()
        case TEMPLATE_TYPES.SES_TEMPLATE:
          return getSesTemplateResults()
        default:
          return getSimpleTemplateResults()
      }
    },
    checkDone: (data) => data?.status === FILE_STATUSES.PROCESSED,
    interval: flowDetails?.interval ?? 3000,
    skip: !flowDetails?.templateId,
  })

  async function getSesTemplateResults() {
    const emailTriggerResults = await getSesEmailMessages(flowDetails?.templateId!, flowDetails?.triggerOptions?.from!)
    setEmailTriggerResults(emailTriggerResults)

    return { status: FILE_STATUSES.IN_PROGRESS }
  }

  async function getSimpleTemplateResults() {
    const restOperation = get({
      apiName: API_NAME,
      path: `${API_PATH_TEMPLATE_FILES}?templateId=${flowDetails?.templateId}`,
    })
    const response = await restOperation.response
    const responseBody = (await response.body.json()) as unknown as { items: IDocumentType[] }
    const responseDocuments = filterProcessingResult(responseBody.items || [])

    const allProcessed = responseDocuments.every((item) => item.status === FILE_STATUSES.PROCESSED)
    const status = allProcessed ? FILE_STATUSES.PROCESSED : FILE_STATUSES.IN_PROGRESS

    // const allInProgress = responseDocuments.every((item) => item.status === FILE_STATUSES.IN_PROGRESS)

    const currentTime = Date.now()

    if (!startTimeRef.current) {
      startTimeRef.current = currentTime
    }

    if (allProcessed) {
      setIsRunning(false)
      startTimeRef.current = null
    }

    // Temporarily disable timeout
    /*      else if (allInProgress && currentTime - startTimeRef.current > 900000) {
                setSnackbar({
                  text: 'Processing is taking longer than expected. Please try again later.',
                  severity: 'error',
                })
                setIsRunning(false)
                startTimeRef.current = null
                setError('Something went wrong. Please contact support.')
                throw new Error('Processing timeout after 3 minutes')
              }*/

    if (status === FILE_STATUSES.PROCESSED) {
      setIsRunning(false)
      setFlowDetails((prevState) => ({ ...prevState, templateId: undefined, templateType: undefined }))
      setProcessingResults(responseDocuments)
      return { status, responseBody }
    }

    setProcessingResults(responseDocuments)
    return { status, responseBody }
  }

  return { setFlowDetails }
}
