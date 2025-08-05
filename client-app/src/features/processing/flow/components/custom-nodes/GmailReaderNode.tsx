import CustomNodeContainer from './CustomNodeContainer.tsx'
import EmailReader from '../email-reader/EmailReader.tsx'
import { NodeProps } from '@xyflow/react'
import { Box } from '@mui/material'
import LabeledHandle from '../../../common/components/LabeledHandle.tsx'
import { CustomNodeProvider } from '../../context/CustomNodeContext.tsx'

export default function GmailReaderNode(props: NodeProps) {
  const { id } = props
  return (
    <CustomNodeContainer nodeProps={props}>
      <CustomNodeProvider nodeId={id}>
        <EmailReader />

        <Box position="absolute" bottom={0} width="100%" height="50px">
          {/*          <LabeledHandle id="Emails" left="58%" label="Emails" />*/}
          <LabeledHandle id="Attachments" left="82%" label="Attachments" />
        </Box>
      </CustomNodeProvider>
    </CustomNodeContainer>
  )
}
