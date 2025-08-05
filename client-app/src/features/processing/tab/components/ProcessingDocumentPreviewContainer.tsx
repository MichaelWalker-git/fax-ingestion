import { use } from 'react'
import { ProcessingContext } from '../context/ProcessingContext.tsx'
import DocumentPreview from '../../../documents/components/DocumentPreview.tsx'

export default function ProcessingDocumentPreviewContainer() {
  const { selectedPages, childDocumentsPreviewUrls } = use(ProcessingContext)

  const selectedPageKeys = Object.keys(childDocumentsPreviewUrls).filter((key) => selectedPages.includes(key))
  const previews = selectedPageKeys.map((key) => childDocumentsPreviewUrls[key].url) as string[]
  return <DocumentPreview previewUrls={previews} />
}
