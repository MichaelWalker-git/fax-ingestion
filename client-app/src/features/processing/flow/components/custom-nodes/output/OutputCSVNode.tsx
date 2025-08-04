import { Button, Stack, TextField, Typography } from '@mui/material'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { useEffect, useMemo, useState } from 'react'
import { useProcessingFlow } from '../../../context/ProcessingFlowContext.tsx'
import CustomNodeContainer from '../CustomNodeContainer.tsx'
import { normalizeFiles } from '../../../helpers/files.ts'
import CustomNodeHeader from '../../../../common/components/custom-node/CustomNodeHeader.tsx'
import Iconify from '../../../../../../shared/components/iconify'
import { handleProcessingResults } from '../../../helpers/processing-results.ts'
import { downloadAllFilesAsCsv } from '../../../../../../utils/files.ts'

export default function OutputCSVNode(props: NodeProps) {
  const { id } = props
  const { getCustomNode, processingResults, getParentInputNode } = useProcessingFlow()

  const customNode = getCustomNode(id)

  const parentInputNode = getParentInputNode(id)

  const allSelectedFiles = parentInputNode?.processingFiles || []

  const [outputFileNames, setOutputFileNames] = useState<{ [key: string]: string }>(normalizeFiles(allSelectedFiles))

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setOutputFileNames(normalizeFiles(allSelectedFiles))
  }, [parentInputNode?.processingFiles])

  const { isAllProcessed } = useMemo(() => {
    return handleProcessingResults(customNode, processingResults)
  }, [customNode, processingResults])

  const downloadAllResults = () => {
    if (processingResults) {
      downloadAllFilesAsCsv(processingResults, outputFileNames)
    }
  }

  if (!customNode) {
    return null
  }

  return (
    <CustomNodeContainer nodeProps={props}>
      <Stack gap={2}>
        <CustomNodeHeader nodeId={props.id}>CSV</CustomNodeHeader>
        {allSelectedFiles.map((selectedFile) => (
          <Stack key={selectedFile.name} flexDirection="row" alignItems="center" gap={1}>
            <TextField
              size="small"
              label="File name"
              value={outputFileNames[selectedFile.name]}
              onChange={(event) => setOutputFileNames({ ...outputFileNames, [selectedFile.name]: event.target.value })}
            />
            <Typography variant="body2" color="text.secondary">
              .csv
            </Typography>
          </Stack>
        ))}
        <Stack direction="row" justifyContent="end">
          {isAllProcessed && (
            <Button startIcon={<Iconify icon="ic:baseline-file-download" />} onClick={downloadAllResults}>
              Export
            </Button>
          )}
        </Stack>
      </Stack>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </CustomNodeContainer>
  )
}
