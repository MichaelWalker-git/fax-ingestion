import { Stack, Typography } from '@mui/material'
import { IDocumentType } from '../../../types/DocumentType.ts'
import DocumentDetailsItem from './DocumentDetailsItem.tsx'

interface DocumentDetailsProps {
  document: IDocumentType
  fileFormat?: string | null
}

export default function DocumentDetails({ document, fileFormat }: DocumentDetailsProps) {
  const { createdAt, updatedAt } = document
  return (
    <Stack gap={1}>
      <Typography variant="subtitle2">Details</Typography>
      <DocumentDetailsItem name="Format" value={fileFormat || ''} />
      <DocumentDetailsItem name="Uploaded" value={new Date(createdAt).toDateString()} />
      <DocumentDetailsItem name="Modified" value={updatedAt && new Date(updatedAt).toDateString()} />
    </Stack>
  )
}
