import { Box, CircularProgress, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'
import { useEffect } from 'react'
import useChildDocuments from '../../../shared/hooks/useChildDocuments.ts'
import { IDocumentType } from '../../../types/DocumentType.ts'

interface DocumentChildrenListProps {
  parentDocument?: IDocumentType
  onSelectDocument: (childDocument: IDocumentType) => void
  selectedDocumentId?: string
}

export default function DocumentChildrenList({
  parentDocument,
  selectedDocumentId,
  onSelectDocument,
}: DocumentChildrenListProps) {
  const { childDocuments, loading } = useChildDocuments(parentDocument)

  useEffect(() => {
    if (!selectedDocumentId && childDocuments) {
      onSelectDocument(childDocuments[0])
    }
  }, [selectedDocumentId, childDocuments, onSelectDocument])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box p={2} borderRight="1px solid #ccc">
      <FormControl>
        <FormLabel id="radio-buttons-group-label" sx={{ mb: 2 }}>
          Select the document page
        </FormLabel>
        <RadioGroup
          aria-labelledby="radio-buttons-group-label"
          defaultValue="female"
          name="radio-buttons-group"
          value={selectedDocumentId || ''}
          onChange={(_, value) =>
            onSelectDocument(childDocuments.find((childDocument) => childDocument.sortKey === value)!)
          }
        >
          {childDocuments.map((childDocument) => (
            <FormControlLabel
              key={childDocument.sortKey}
              value={childDocument.sortKey}
              control={<Radio />}
              label={childDocument.filename}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  )
}
