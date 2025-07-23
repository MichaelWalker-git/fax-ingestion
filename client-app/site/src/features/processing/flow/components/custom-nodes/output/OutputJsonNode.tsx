import { Button, Stack } from '@mui/material'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { useEffect, useMemo, useState } from 'react'
import { useProcessingFlow } from '../../../context/ProcessingFlowContext.tsx'
import CustomNodeContainer from '../CustomNodeContainer.tsx'
import CustomNodeHeader from '../../../../common/components/custom-node/CustomNodeHeader.tsx'
import { normalizeFiles } from '../../../helpers/files.ts'
import Iconify from '../../../../../../shared/components/iconify'
import { downloadAllFiles } from '../../../../../../utils/files.ts'
import { FILE_STATUSES } from '../../../../../../shared/constants/file-constants.ts'
import SendEmailButton from '../../../../common/components/buttons/SendEmailButton.tsx'
import ResultFileNames from './ResultFileNames.tsx'
import { ProcessingResult } from '../../../../../../types/ProcessingResults.ts'

export default function OutputJsonNode(props: NodeProps) {
  const { id } = props
  const { getCustomNode, processingResults, getParentInputNode, emailTriggerResults } = useProcessingFlow()

  const customNode = getCustomNode(id)

  const parentInputNode = getParentInputNode(id)

  const allSelectedFiles = parentInputNode?.processingFiles || []

  const [outputFileNames, setOutputFileNames] = useState<{ [key: string]: string }>(normalizeFiles(allSelectedFiles))

  const emailTriggerAttachments = useMemo(() => {
    return emailTriggerResults?.flatMap((result) => result.attachments)
  }, [emailTriggerResults])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (allSelectedFiles && allSelectedFiles.length > 0) {
      setOutputFileNames(normalizeFiles(allSelectedFiles))
    } else {
      setOutputFileNames(normalizeFiles(emailTriggerAttachments?.map((file) => ({ name: file?.filename })) || []))
    }
  }, [parentInputNode?.processingFiles, emailTriggerAttachments])

  const isAllProcessed = useMemo(() => {
    return processingResults?.every((result) => result.status === FILE_STATUSES.PROCESSED)
  }, [processingResults])

  const downloadAllResults = () => {
    const results = (processingResults || emailTriggerAttachments) as unknown as ProcessingResult[]
    if (results) {
      downloadAllFiles(results, outputFileNames)
    }
  }

  if (!customNode) {
    return null
  }

  const fileNames =
    allSelectedFiles && allSelectedFiles?.length > 0
      ? allSelectedFiles.map((file) => file.name)
      : emailTriggerAttachments?.map((file) => file?.filename)

  return (
    <CustomNodeContainer nodeProps={props}>
      <Stack gap={2}>
        <CustomNodeHeader nodeId={props.id}>JSON</CustomNodeHeader>
        <ResultFileNames
          fileNames={fileNames || []}
          setOutputFileNames={setOutputFileNames}
          outputFileNames={outputFileNames}
        />
        <Stack direction="row" justifyContent="end">
          {(isAllProcessed || (emailTriggerAttachments && emailTriggerAttachments.length > 0)) && (
            <Button type="button" startIcon={<Iconify icon="ic:baseline-file-download" />} onClick={downloadAllResults}>
              Export
            </Button>
          )}
          {isAllProcessed && <SendEmailButton nodeId={id} outputFileNames={outputFileNames} />}
        </Stack>
      </Stack>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </CustomNodeContainer>
  )
}
