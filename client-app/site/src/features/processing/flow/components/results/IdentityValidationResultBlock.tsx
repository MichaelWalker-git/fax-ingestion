import { useState } from 'react'
import useProcessingResult from '../../../common/hooks/useProcessingResult.ts'
import { PROCESSING_MODES } from '../../../../../shared/constants/processing-constants.ts'
import { Alert, Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import Iconify from '../../../../../shared/components/iconify'
import AccuracyComponent from '../../../common/components/AccuracyComponent.tsx'
import CircularLoader from '../../../../../shared/components/loader/CircularLoader.tsx'
import { RentalAppResult } from '../../../../../types/RentalApp.ts'
import { IDocumentType } from '../../../../../types/DocumentType.ts'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

interface RentalAppResultBlockProps {
  processingDocument: IDocumentType
  presignedUrl?: string
}

export default function IdentityValidationResultBlock({ processingDocument, presignedUrl }: RentalAppResultBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { parsedFileResult, parsingError, loading } = useProcessingResult({
    processingDocument,
    mode: PROCESSING_MODES.FORM,
    resultPresignedUrl: presignedUrl,
  })

  const rentalAppResult: RentalAppResult | undefined = (parsedFileResult?.result ||
    processingDocument.promptResult) as RentalAppResult

  return (
    <Stack sx={{ p: 1, border: '1px dashed #ccc', borderRadius: '8px', gap: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap={1}>
          <Typography variant="body1">{processingDocument.filename}</Typography>
          <Iconify icon="ic:baseline-check" color="primary.main" />
        </Stack>
        <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
          <Iconify
            icon={isCollapsed ? 'ic:baseline-expand-more' : 'ic:baseline-expand-less'}
            sx={{ width: 20, height: 20 }}
            color="primary.main"
          />
        </IconButton>
      </Stack>
      {parsedFileResult?.accuracy && (
        <AccuracyComponent text="Extraction accuracy:" accuracy={parsedFileResult?.accuracy} />
      )}
      {!isCollapsed && rentalAppResult && (
        <>
          {parsingError && <Alert severity="error">Something went wrong</Alert>}
          {loading && <CircularLoader text="Loading results" />}
          {!loading && (
            <Stack gap={2}>
              <Stack gap={1}>
                {Object.entries(rentalAppResult.consistency_check).map(([key, value]) => {
                  return (
                    <Stack
                      key={key}
                      direction="row"
                      sx={{
                        border: '1px dashed #ccc',
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      <Typography variant="body2" flex={1}>
                        {key}
                      </Typography>
                      <Box display="flex" alignItems="center" flex={1}>
                        <Typography variant="body2">{value}</Typography>{' '}
                        <Tooltip title="Copy text">
                          <IconButton onClick={() => navigator.clipboard.writeText(value)} size="small">
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Stack>
                  )
                })}
              </Stack>
              {rentalAppResult.explanation_of_accuracy_score && (
                <Stack gap={1}>
                  <Typography variant="subtitle2">Explanation of accuracy score </Typography>
                  <Typography variant="body2" ml={1}>
                    {rentalAppResult.explanation_of_accuracy_score}
                  </Typography>
                </Stack>
              )}

              {rentalAppResult.notes && (
                <Stack gap={1}>
                  <Typography variant="subtitle2">Notes: </Typography>
                  <Typography variant="body2" ml={1}>
                    {rentalAppResult.notes}
                  </Typography>
                </Stack>
              )}

              {rentalAppResult.potential_improvements && (
                <Stack gap={1}>
                  <Typography variant="subtitle2">Potential improvements </Typography>
                  <Typography variant="body2" ml={1}>
                    {rentalAppResult.potential_improvements}
                  </Typography>
                </Stack>
              )}
            </Stack>
          )}
        </>
      )}
    </Stack>
  )
}
