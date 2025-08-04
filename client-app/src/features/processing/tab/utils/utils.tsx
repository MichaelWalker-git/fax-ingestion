import { PROCESSING_MODES } from '../../../../shared/constants/processing-constants.ts'
import PageSelection from '../components/PageSelection.tsx'
import DataExtraction from '../components/extraction/DataExtraction.tsx'
import ProcessingResultContainer from '../components/processing-result/ProcessingResultContainer.tsx'
import { IFormSchema, ITableSchema } from '../../../../types/Scema.ts'

export const steps = [
  {
    label: 'Page Selection',
    subLabel: 'Select the pages you want to process.',
    content: <PageSelection />,
  },
  {
    label: 'Data Extraction',
    subLabel: 'Extract key information from your document.',
    content: <DataExtraction />,
  },
  {
    label: 'Review & Export',
    subLabel: 'Verify and refine extracted data if needed.',
    content: <ProcessingResultContainer />,
  },
]

export const getPrompt = (mode?: string, prompt?: string) => {
  switch (mode) {
    case PROCESSING_MODES.QA:
      return prompt
    case PROCESSING_MODES.FORM:
      return undefined
    default:
      return undefined
  }
}

export function getSchema(formSchema?: IFormSchema, tableSchema?: ITableSchema, mode?: string) {
  if (mode === PROCESSING_MODES.FORM) {
    return formSchema
  }

  if (mode === PROCESSING_MODES.TABLE) {
    return tableSchema?.length ? tableSchema : undefined
  }
}
