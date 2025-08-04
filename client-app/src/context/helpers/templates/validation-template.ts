import { createTextExtractionNode } from './text-extraction.ts'
import { createInputNode, createJsonOutputNode, createNode, onConnect } from './common.ts'
import { NODE_TYPES } from '../../../shared/constants/processing-flow.ts'

export function createValidationTemplate({
  screenToFlowPosition,
  setNodes,
  putCustomNode,
  event,
  setEdges,
  setRootNodeId,
  additionalAttributes,
  schema,
}: any) {
  const inputNode = createInputNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    event,
    additionalAttributes: additionalAttributes,
  })

  const textExtractionNode = createTextExtractionNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    event: { clientX: event.clientX + 400, clientY: event.clientY + 200 },
  })

  const { target: updatedTextExtractionNode } = onConnect({
    source: inputNode,
    target: textExtractionNode,
    setEdges,
    putCustomNode,
  })

  const textExtractionOutputNode = createJsonOutputNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    event: { clientX: event.clientX, clientY: event.clientY + 400 },
  })

  const { target: updatedTextExtractionOutputNode } = onConnect({
    source: updatedTextExtractionNode,
    target: textExtractionOutputNode,
    setEdges,
    putCustomNode,
  })

  const validationNode = createValidationNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    event: { clientX: event.clientX + 400, clientY: event.clientY + 600 },
    schema,
  })

  const { target: updatedValidationNode } = onConnect({
    source: updatedTextExtractionOutputNode,
    target: validationNode,
    setEdges,
    putCustomNode,
  })

  const outputNode = createJsonOutputNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    event: { clientX: event.clientX, clientY: event.clientY + 800 },
  })

  onConnect({ source: updatedValidationNode, target: outputNode, setEdges, putCustomNode })

  setRootNodeId(inputNode.id)
}

function createValidationNode({ screenToFlowPosition, setNodes, putCustomNode, event, schema }: any) {
  return createNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    clientX: event.clientX,
    clientY: event.clientY,
    type: NODE_TYPES.IDENTITY_VALIDATION,
    schema,
  })
}
