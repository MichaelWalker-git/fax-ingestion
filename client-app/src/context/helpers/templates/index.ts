import { createTextExtractionTemplate } from './text-extraction.ts'
import { createFormExtractionTemplate } from './form-extraction.ts'
import { createValidationTemplate } from './validation-template.ts'
import { createTableExtractionTemplate } from './table-extraction.ts'
import { TEMPLATES } from '../../../shared/constants/processing-flow.ts'
import {
  RENTAL_APP_DEFAULT_SCHEMA,
  RENTAL_APP_INPUT_DESCRIPTION,
} from '../../../features/processing/flow/constants/rental-app.ts'

export function createsFlowFromTemplate({
  type,
  screenToFlowPosition,
  setNodes,
  putCustomNode,
  event,
  setEdges,
  setRootNodeId,
}: any) {
  switch (type) {
    case TEMPLATES.IDENTITY_VALIDATION_TEMPLATE:
      createValidationTemplate({
        screenToFlowPosition,
        setNodes,
        putCustomNode,
        event,
        setEdges,
        setRootNodeId,
        additionalAttributes: {
          description: RENTAL_APP_INPUT_DESCRIPTION,
          template: TEMPLATES.IDENTITY_VALIDATION_TEMPLATE,
        },
      })
      break
    case TEMPLATES.RENTAL_APP_TEMPLATE:
      createValidationTemplate({
        screenToFlowPosition,
        setNodes,
        putCustomNode,
        event,
        setEdges,
        setRootNodeId,
        additionalAttributes: { description: RENTAL_APP_INPUT_DESCRIPTION, template: TEMPLATES.RENTAL_APP_TEMPLATE },
        schema: RENTAL_APP_DEFAULT_SCHEMA,
      })
      break
    case TEMPLATES.TEXT_EXTRACTION_TEMPLATE:
      createTextExtractionTemplate({ setNodes, screenToFlowPosition, putCustomNode, event, setEdges, setRootNodeId })
      break
    case TEMPLATES.FORM_EXTRACTION_TEMPLATE:
      createFormExtractionTemplate({ setNodes, screenToFlowPosition, putCustomNode, event, setEdges, setRootNodeId })
      break
    case TEMPLATES.TABLE_EXTRACTION_TEMPLATE:
      createTableExtractionTemplate({ setNodes, screenToFlowPosition, putCustomNode, event, setEdges, setRootNodeId })
      break
  }
}
