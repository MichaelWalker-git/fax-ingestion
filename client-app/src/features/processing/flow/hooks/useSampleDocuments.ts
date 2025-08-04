import { useQuery } from 'react-query'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import { useEffect } from 'react'
import { UploadedFile } from '../../../../types/File.ts'
import { CustomNode } from '../../../../types/ProcessingFlow.ts'
import { useProcessingFlow } from '../context/ProcessingFlowContext.tsx'
import { API_PATH_FILES } from '../../../../shared/api/paths.ts'
import { getDocuments } from '../../../../shared/api/actions/document.ts'
import { TEMPLATES } from '../../../../shared/constants/processing-flow.ts'
import { FILE_UPLOAD_FROM } from '../../../../shared/constants/file-constants.ts'

export default function useSampleDocuments({
  handleNewUploadedDocuments,
  customNode,
}: { handleNewUploadedDocuments: (files: UploadedFile[]) => void; customNode?: CustomNode }) {
  const { enableSampleDocuments } = useProcessingFlow()

  const sampleType = SAMPLE_TYPE_MAPPING[customNode?.additionalAttributes?.template]

  const { isLoading, error, data } = useQuery<IDocumentType[]>(
    [API_PATH_FILES, sampleType],
    () => getDocuments([sampleType]),
    {
      enabled: !!enableSampleDocuments && !!sampleType,
    },
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (data?.length && enableSampleDocuments) {
      const files = data.map((file) => ({ fileId: file.sortKey, name: file.filename }))
      handleNewUploadedDocuments(files)
    }
  }, [data])

  return {
    isLoading,
    error,
  }
}

const SAMPLE_TYPE_MAPPING = {
  [TEMPLATES.TEXT_EXTRACTION_TEMPLATE]: FILE_UPLOAD_FROM.SAMPLE_TEXT,
  [TEMPLATES.TABLE_EXTRACTION_TEMPLATE]: FILE_UPLOAD_FROM.SAMPLE_TABLE,
  [TEMPLATES.FORM_EXTRACTION_TEMPLATE]: FILE_UPLOAD_FROM.SAMPLE_FORM,
  [TEMPLATES.IDENTITY_VALIDATION_TEMPLATE]: FILE_UPLOAD_FROM.SAMPLE_MEDICARE,
  [TEMPLATES.RENTAL_APP_TEMPLATE]: FILE_UPLOAD_FROM.SAMPLE_RENTAL_APP,
}
