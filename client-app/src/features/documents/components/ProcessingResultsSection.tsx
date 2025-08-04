import { Alert, Box, Paper, Typography } from '@mui/material'
import { useState } from 'react'
import { IDocumentType } from '../../../types/DocumentType.ts'
import DocumentPreviewDeprecated from './DocumentPreviewDeprecated.tsx'
import DocumentProcessingSummary from '../../processing/common/components/DocumentProcessingSummary.tsx'
import DocumentChildrenList from './DocumentChildrenList.tsx'

interface ProcessingResultsSectionProps {
  document: IDocumentType
}

export default function ProcessingResultsSection({ document }: ProcessingResultsSectionProps) {
  const [selectedChildDocument, setSelectedChildDocument] = useState<IDocumentType | undefined>(undefined)

  const currentDocument = document.isHasChildren ? selectedChildDocument! : document
  const hasResult =
    (currentDocument?.promptResult && Object.keys(currentDocument?.promptResult).length > 0) ||
    currentDocument?.resultS3Path

  return (
    <Box display="flex" gap={2}>
      <Paper sx={{ flex: 1, p: 2 }}>
        {currentDocument && <DocumentPreviewDeprecated document={currentDocument} />}
      </Paper>
      <Paper sx={{ flex: 2, p: 2 }}>
        <Typography variant="h6" align="center">
          Processing Results
        </Typography>
        <Box display="flex" gap={4}>
          {document.isHasChildren && (
            <Box flex={1}>
              <DocumentChildrenList
                parentDocument={document}
                selectedDocumentId={selectedChildDocument?.sortKey}
                onSelectDocument={setSelectedChildDocument}
              />
            </Box>
          )}
          <Box flex={2}>
            {currentDocument && hasResult && (
              <DocumentProcessingSummary processingDocument={currentDocument} parentDocument={document} />
            )}
            {!hasResult && (
              <Box display="flex" pt={4}>
                <Alert variant="outlined" severity="info">
                  This document has not been processed
                </Alert>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
