import { useParams } from 'react-router-dom'
import ProcessingContainer from '../components/ProcessingContainer.tsx'
import { Alert } from '@mui/material'
import { ProcessingProvider } from '../context/ProcessingContext.tsx'

export default function ProcessingPage() {
  const { id } = useParams()

  if (!id) {
    return <Alert severity="error">URL is wrong</Alert>
  }

  return (
    <>
      <ProcessingProvider>
        <ProcessingContainer documentId={id} />
      </ProcessingProvider>
    </>
  )
}
