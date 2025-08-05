import { Document, Page, pdfjs } from 'react-pdf'
import { useState } from 'react'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

interface Props {
  url: string
}

export const PdfViewer = ({ url }: Props) => {
  const [numPages, setNumPages] = useState<number | null>(null)

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  return (
    <div>
      <Document
        file={url}
        onLoadSuccess={onLoadSuccess}
        onLoadError={(error) => console.error('PDF load error:', error)}
      >
        {Array.from(new Array(numPages || 0), (_, index) => (
          <Page key={index} pageNumber={index + 1} />
        ))}
      </Document>
    </div>
  )
}
