import CustomNodeContainer from './CustomNodeContainer.tsx'
import { NodeProps } from '@xyflow/react'
import { Box } from '@mui/material'
import LabeledHandle from '../../../common/components/LabeledHandle.tsx'
import { CustomNodeProvider } from '../../context/CustomNodeContext.tsx'
import EmailTrigger from '../configuration/EmailTrigger.tsx'

export default function EmailTriggerNode(props: NodeProps) {
  const { id } = props
  return (
    <CustomNodeContainer nodeProps={props}>
      <CustomNodeProvider nodeId={id}>
        <EmailTrigger />

        <Box position="absolute" bottom={0} width="100%" height="50px">
          <LabeledHandle id="Attachments" left="46%" label="Attachments" />
        </Box>
      </CustomNodeProvider>
    </CustomNodeContainer>
  )
}
