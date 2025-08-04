import { FILE_STATUSES } from '../../../../shared/constants/file-constants.ts'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import { PROCESSING_MODES } from '../../../../shared/constants/processing-constants.ts'

export function filterProcessingResult(processingResults?: IDocumentType[]) {
  const completedChoiceResults: { [key: string]: IDocumentType } = {}
  processingResults?.forEach((result) => {
    if (result.choiceId && result.status === FILE_STATUSES.PROCESSED) {
      completedChoiceResults[result.choiceId] = result
    }
  })
  return (
    processingResults?.filter((result) => {
      return (
        !(result.choiceId && result.status === FILE_STATUSES.IN_PROGRESS && completedChoiceResults[result.choiceId]) &&
        result.tab !== PROCESSING_MODES.QA_CHOICE
      )
    }) || []
  )
}
