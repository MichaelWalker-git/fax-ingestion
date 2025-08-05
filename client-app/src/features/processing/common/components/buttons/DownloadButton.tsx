import DownloadIcon from '@mui/icons-material/Download'
import { IconButton as MuiIconButton, Tooltip } from '@mui/material'
import useProcessingResult from '../../hooks/useProcessingResult.ts'
import { IDocumentType } from '../../../../../types/DocumentType.ts'
import { ProcessingResult } from '../../../../../types/ProcessingResults.ts'

interface DownloadButtonProps {
  processingDocument: IDocumentType
  processingType?: string
  fileName?: string
  outputNodeType?: string
}

export default function DownloadButton({
  processingDocument,
  processingType,
  fileName,
  outputNodeType,
}: DownloadButtonProps) {
  const { downloadFile } = useProcessingResult({
    processingDocument: processingDocument as ProcessingResult,
    mode: processingType,
    fileName,
    outputNodeType,
  })

  return (
    <Tooltip title="Download">
      <MuiIconButton onClick={downloadFile} color="inherit" size="large">
        <DownloadIcon />
      </MuiIconButton>
    </Tooltip>
  )
}
