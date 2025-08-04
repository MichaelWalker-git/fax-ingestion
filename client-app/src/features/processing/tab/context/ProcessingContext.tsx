import { ReactNode, createContext, useState } from 'react'
import { PROCESSING_MODES } from '../../../../shared/constants/processing-constants.ts'
import { IProcessingContext } from '../../../../types/DocumentProcessing.ts'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import { ChildDocumentsPreviewUrls } from '../../../../types/Preview.ts'
import { IFormSchema, ITableSchema } from '../../../../types/Scema.ts'

export const ProcessingContext = createContext<IProcessingContext>({
  processingDocument: undefined,
  setProcessingDocument: () => {},
  setProcessingError: () => {},
  setDisabledNextStep: () => {},
  disabledNextStep: false,
  setFormSchema: () => undefined,
  setTableSchema: () => undefined,
  childDocumentsPreviewUrls: {},
  setIsRunning: () => {},
  setIsProcessingStarting: () => {},
  selectedPages: [],
  setSelectedPages: () => {},
  selectAll: false,
  setSelectAll: () => {},
})

export const ProcessingProvider = ({ children }: { children: ReactNode }) => {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState(PROCESSING_MODES.TEXT)
  const [processingDocument, setProcessingDocument] = useState<IDocumentType | undefined>()
  const [parentDocument, setParentDocument] = useState<IDocumentType | undefined>()
  const [processingError, setProcessingError] = useState('')
  const [disabledNextStep, setDisabledNextStep] = useState(false)
  const [formSchema, setFormSchema] = useState<IFormSchema>()
  const [tableSchema, setTableSchema] = useState<ITableSchema>()
  const [previewUrl, setPreviewUrl] = useState<string | undefined>()
  const [childDocumentsPreviewUrls, setChildDocumentsPreviewUrls] = useState<ChildDocumentsPreviewUrls>({})
  const [isValidationError, setIsValidationError] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isProcessingStarting, setIsProcessingStarting] = useState(false)
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  return (
    <ProcessingContext.Provider
      value={{
        processingDocument,
        prompt,
        setPrompt,
        setProcessingDocument,
        processingError,
        setProcessingError,
        mode,
        setMode,
        setDisabledNextStep,
        disabledNextStep,
        formSchema,
        setFormSchema,
        tableSchema,
        setTableSchema,
        parentDocument,
        setParentDocument,
        previewUrl,
        setPreviewUrl,
        childDocumentsPreviewUrls,
        setChildDocumentsPreviewUrls,
        isValidationError,
        setIsValidationError,
        isRunning,
        setIsRunning,
        isProcessingStarting,
        setIsProcessingStarting,
        selectedPages,
        setSelectedPages,
        selectAll,
        setSelectAll,
      }}
    >
      {children}
    </ProcessingContext.Provider>
  )
}
