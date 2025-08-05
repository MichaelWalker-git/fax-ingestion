import { use } from 'react'
import { ProcessingContext } from '../../../tab/context/ProcessingContext.tsx'
import DocumentPrompt from './DocumentPrompt.tsx'

export default function DocumentPromptContainer() {
  const { setPrompt, prompt, setIsValidationError } = use(ProcessingContext)

  return <DocumentPrompt prompt={prompt} setPrompt={setPrompt} setIsValidationError={setIsValidationError} />
}
