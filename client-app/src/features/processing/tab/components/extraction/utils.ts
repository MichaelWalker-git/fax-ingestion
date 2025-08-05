import { PROCESSING_MODES, PROCESSING_MODES_TYPE } from '../../../../../shared/constants/processing-constants.ts'

type ExtractionMethod = {
  icon: string
  text: string
  warning?: string
  value: PROCESSING_MODES_TYPE
}

export const EXTRACTION_METHODS: ExtractionMethod[] = [
  {
    icon: 'ic:baseline-notes',
    text: 'Text',
    value: PROCESSING_MODES.TEXT,
  },
  {
    icon: 'ic:baseline-view-agenda',
    text: 'Form',
    value: PROCESSING_MODES.FORM,
  },
  {
    icon: 'ic:baseline-calendar-view-month',
    text: 'Table',
    value: PROCESSING_MODES.TABLE,
  },
  {
    icon: 'ic:baseline-question-answer',
    text: 'Question',
    value: PROCESSING_MODES.QA,
  },
]
