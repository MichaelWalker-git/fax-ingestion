import { FILE_STATUSES } from '../../../../shared/constants/file-constants.ts'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import { CustomNode } from '../../../../types/ProcessingFlow.ts'
import { PROCESSING_MODES } from '../../../../shared/constants/processing-constants.ts'

export function handleProcessingResults(currentNode?: CustomNode, processingResults?: IDocumentType[]) {
  const processingDocumentResults = processingResults?.filter((result) => result.taskId === currentNode?.children?.[0])

  const isInProgress = processingDocumentResults?.some(
    (result) => result.status === FILE_STATUSES.IN_PROGRESS || result.status === FILE_STATUSES.PARTIALLY_PROCESSED,
  )

  const isAllProcessed = processingDocumentResults?.every((result) => result.status === FILE_STATUSES.PROCESSED)

  return { processingDocumentResults, isInProgress, isAllProcessed }
}

export const RESULT_ITEM_TEXT_MAPPING = {
  [PROCESSING_MODES.MEDICARE]: 'Identity validation result',
}
