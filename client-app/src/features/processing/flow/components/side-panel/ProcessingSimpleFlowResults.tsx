import { Stack } from '@mui/material'
import ResultItem from './ResultItem.tsx'
import CircularLoader from '../../../../../shared/components/loader/CircularLoader.tsx'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'
import { useMemo } from 'react'
import { filterProcessingResult } from '../../../common/helpers/processing-results.ts'
import groupBy from 'lodash.groupby'
import { getProcessingFilesFromNode } from '../../helpers/files.ts'
import { useRemainingProcessingTime } from '../../../common/hooks/useRemainingProcessingTime.tsx'

interface ProcessingSimpleFlowResults {
  processingResults?: any[]
  isRunning: boolean
}

export default function ProcessingSimpleFlowResults({ processingResults, isRunning }: ProcessingSimpleFlowResults) {
  const { getRootNode } = useProcessingFlow()

  const filteredProcessingResults = useMemo(() => filterProcessingResult(processingResults), [processingResults])

  const groupedResults = groupBy(filteredProcessingResults, (item) => item.tab)

  const rootNode = getRootNode()

  const processingFilesItems = getProcessingFilesFromNode(rootNode)

  const remainingMinutes = useRemainingProcessingTime(processingFilesItems.length)

  return (
    <>
      <Stack gap={1}>
        {Object.keys(groupedResults).map((key) => (
          <ResultItem key={key} processingMode={key} processingResults={groupedResults[key]} />
        ))}
      </Stack>
      {isRunning && (
        <CircularLoader
          text="Processing your document..."
          secondaryText={`Estimated time remaining: ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`}
        />
      )}
    </>
  )
}
