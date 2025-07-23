import usePolling from '../../../../shared/hooks/usePolling.ts'
import { fetchChildDocuments, getDocument } from '../../../../shared/api/actions/document.ts'
import { FILE_STATUSES } from '../../../../shared/constants/file-constants.ts'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import { useEffect, useRef, useState } from 'react'
import { CustomNode } from '../../../../types/ProcessingFlow.ts'
import { useProcessingFlow } from '../context/ProcessingFlowContext.tsx'

export function useChildPages({ customNode }: { customNode?: CustomNode }) {
  const [newUploadedDocuments, setNewUploadedDocuments] = useState<string[]>([])
  const [isPolling, setIsPolling] = useState(false)
  const { putCustomNode, setIsFilesPreprocessing } = useProcessingFlow()

  const handledDocumentsRef = useRef<Set<string>>(new Set())

  const [childDocuments, setChildDocuments] = useState<IDocumentType[]>([])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (customNode && childDocuments.length > 0) {
      putCustomNode({
        ...customNode,
        childrenPages: childDocuments,
      })
    }
  }, [childDocuments])

  usePolling({
    apiCall: async () => {
      const unprocessedDocumentIds = newUploadedDocuments.filter((id) => !handledDocumentsRef.current.has(id))
      if (unprocessedDocumentIds.length === 0) {
        return { status: FILE_STATUSES.INITIALIZED }
      }

      if (!isPolling && unprocessedDocumentIds.length > 0) {
        setIsPolling(true)
        setIsFilesPreprocessing(true)
      }

      const results = await Promise.all(
        unprocessedDocumentIds.map(async (documentId) => {
          const responseDocument = await getDocument(documentId)
          if (responseDocument.status !== FILE_STATUSES.INITIALIZED) {
            setNewUploadedDocuments((prevState) => prevState.filter((id) => id !== documentId))
            if (responseDocument.isHasChildren) {
              const getChildDocumentsFunc = fetchChildDocuments(responseDocument.sortKey)
              const result = (await getChildDocumentsFunc()) as IDocumentType[]
              setChildDocuments((prevState) => [...prevState, ...result])
            }
            handledDocumentsRef.current.add(documentId)
            return documentId
          }
          return null
        }),
      )

      const allProcessed = results.every((id) => id !== null)

      if (allProcessed) {
        setIsPolling(false)
        setIsFilesPreprocessing(false)
      }

      return { status: allProcessed ? FILE_STATUSES.UPLOADED : FILE_STATUSES.INITIALIZED }
    },
    checkDone: (data) => data?.status === FILE_STATUSES.UPLOADED,
    interval: 2000,
    skip: newUploadedDocuments.length === 0,
  })

  return { setNewUploadedDocuments, isPolling }
}
