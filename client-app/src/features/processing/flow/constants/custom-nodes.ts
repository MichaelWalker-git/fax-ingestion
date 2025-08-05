import { NODE_TYPES } from '../../../../shared/constants/processing-flow.ts'
import UploadDocumentNode from '../components/custom-nodes/UploadDocumentNode.tsx'
import {
  FormExtractionNode,
  OutputCSVNode,
  OutputJsonNode,
  QuestionAnsweringNode,
  TableExtractionNode,
  TextExtractionNode,
} from '../components/custom-nodes'
import QuestionAnsweringChoiceNode from '../components/custom-nodes/QuestionAnsweringChoiceNode.tsx'
import IdentityValidationNode from '../components/custom-nodes/IdentityValidationNode.tsx'
import GmailReaderNode from '../components/custom-nodes/GmailReaderNode.tsx'
import EmailTriggerNode from '../components/custom-nodes/EmailTriggerNode.tsx'

export const nodeTypes = {
  [NODE_TYPES.UPLOAD_DOCUMENT]: UploadDocumentNode,
  [NODE_TYPES.TEXT_EXTRACTION]: TextExtractionNode,
  [NODE_TYPES.FORM_EXTRACTION]: FormExtractionNode,
  [NODE_TYPES.TABLE_EXTRACTION]: TableExtractionNode,
  [NODE_TYPES.QUESTION_ANSWERING]: QuestionAnsweringNode,
  [NODE_TYPES.QUESTION_ANSWERING_CHOICE]: QuestionAnsweringChoiceNode,
  [NODE_TYPES.IDENTITY_VALIDATION]: IdentityValidationNode,
  [NODE_TYPES.OUTPUT_CSV]: OutputCSVNode,
  [NODE_TYPES.OUTPUT_JSON]: OutputJsonNode,
  [NODE_TYPES.GMAIL_READER]: GmailReaderNode,
  [NODE_TYPES.EMAIL_TRIGGER]: EmailTriggerNode,
}
