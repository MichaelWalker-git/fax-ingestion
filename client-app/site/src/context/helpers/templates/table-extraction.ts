import { createCsvOutputNode, createInputNode, createNode, onConnect } from './common.ts'
import { NODE_TYPES, TEMPLATES } from '../../../shared/constants/processing-flow.ts'

export function createTableExtractionTemplate({
  setNodes,
  screenToFlowPosition,
  putCustomNode,
  event,
  setEdges,
  setRootNodeId,
}: any) {
  const inputNode = createInputNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    event,
    setEdges,
    additionalAttributes: { template: TEMPLATES.TABLE_EXTRACTION_TEMPLATE },
  })

  const textExtractionNode = createTableExtractionNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    event: { clientX: event.clientX + 320, clientY: event.clientY + 180 },
  })

  const { target: updatedTextExtractionNode } = onConnect({
    source: inputNode,
    target: textExtractionNode,
    setEdges,
    putCustomNode,
  })

  const outputNode = createCsvOutputNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    event: { clientX: event.clientX, clientY: event.clientY + 500 },
  })

  onConnect({ source: updatedTextExtractionNode, target: outputNode, setEdges, putCustomNode })

  setRootNodeId(inputNode.id)
}

function createTableExtractionNode({ screenToFlowPosition, setNodes, putCustomNode, event }: any) {
  return createNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    clientX: event.clientX,
    clientY: event.clientY,
    type: NODE_TYPES.TABLE_EXTRACTION,
  })
}
