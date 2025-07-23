import { Stack, Typography } from '@mui/material'
import CustomNodeDocumentItem from '../../../common/components/custom-node/CustomNodeDocumentItem.tsx'
import { RESULT_ITEM_TEXT_MAPPING } from '../../helpers/processing-results.ts'
import { ProcessingResult } from '../../../../../types/ProcessingResults.ts'
import { IDocumentType } from '../../../../../types/DocumentType.ts'

interface FormExtractionResultProps {
  processingResults: ProcessingResult[] | IDocumentType[]
  itemAdditionText?: string
}

export default function NodeResult({ processingResults, itemAdditionText }: FormExtractionResultProps) {
  return (
    <Stack gap={2.5} pt={1}>
      <Stack gap={1}>
        {processingResults.map((processingResult) => (
          <CustomNodeDocumentItem
            key={processingResult.sortKey}
            name={
              processingResult.filename ||
              (processingResult.tab && RESULT_ITEM_TEXT_MAPPING[processingResult.tab]) ||
              ''
            }
            status={processingResult.status}
            additionText={itemAdditionText}
          />
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        To view more, open the card in full-screen mode
      </Typography>
    </Stack>
  )
}
