import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { PROCESSING_MODES } from '../../../../shared/constants/processing-constants.ts'
import { NODE_TYPE, NODE_TYPES } from '../../../../shared/constants/processing-flow.ts'
import { download } from '../../../../utils/files.ts'
import { fetchResultPresignedUrl } from '../../../../shared/api/actions/presign.ts'
import { ProcessingResult } from '../../../../types/ProcessingResults.ts'
import { IDocumentType } from '../../../../types/DocumentType.ts'

interface UseProcessingResultProps {
  processingDocument: ProcessingResult | IDocumentType
  mode?: string
  fileName?: string
  gridRef?: React.MutableRefObject<any>
  outputNodeType?: NODE_TYPE
  resultPresignedUrl?: string
}

export default function useProcessingResult({
  processingDocument,
  mode,
  fileName,
  gridRef,
  outputNodeType,
  resultPresignedUrl,
}: UseProcessingResultProps) {
  const [parsedFileResult, setParsedFileResult] = useState<{ result: unknown; accuracy: string } | null>(null)
  const [parsingError, setParsingError] = useState(false)

  const { data: presignedUrls, isLoading: loadingPresigned } = useQuery(
    [`result-presigned-url-${processingDocument?.updatedAt}`, processingDocument?.resultS3Path],
    fetchResultPresignedUrl([processingDocument]),
    {
      enabled: !resultPresignedUrl && !!processingDocument?.resultS3Path,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  )

  const presignedUrl = resultPresignedUrl || presignedUrls?.[0]?.getUrl

  const { data: result, isLoading: loadingResult } = useQuery(
    `result-json-${presignedUrl}`,
    async () => {
      const result = await fetch(presignedUrl!, {
        method: 'GET',
      })

      return await result.json()
    },
    { enabled: !!presignedUrl, staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000 },
  )

  useEffect(() => {
    try {
      if (result) {
        const parsedResult =
          typeof result === 'string' ? (JSON.parse(result) as { result: unknown; accuracy: string }) : result
        setParsedFileResult(parsedResult)
      }

      setParsingError(false)
    } catch (e) {
      console.error('Error parsing result', e)
      setParsingError(true)
      setParsedFileResult(null)
    }
  }, [result])

  const downloadFile = async () => {
    let blob: Blob | null = null

    if (mode === PROCESSING_MODES.QA) {
      const text = processingDocument?.promptResult!
      blob = new Blob([text ? JSON.stringify(text) : ''], { type: 'text/plain' })
    } else if (
      !mode ||
      mode === PROCESSING_MODES.FORM ||
      mode === PROCESSING_MODES.TEXT ||
      (mode === PROCESSING_MODES.TABLE && outputNodeType === NODE_TYPES.OUTPUT_JSON)
    ) {
      if (!presignedUrl) {
        return
      }
      const response = await fetch(presignedUrl)
      blob = await response.blob()
    } else if (mode === PROCESSING_MODES.TABLE) {
      gridRef?.current.exportDataAsCsv({
        fileName: fileName ? `${fileName}` : `${processingDocument.filename}-processing-result`,
      })
      return
    }

    if (!blob) {
      return
    }

    download(blob, fileName ? `${fileName}.json` : `${processingDocument.filename}-processing-result.json`)
  }

  return {
    parsedFileResult,
    parsingError,
    downloadFile,
    loading: loadingResult || loadingPresigned,
    result,
    presignedUrl,
  }
}
