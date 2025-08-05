import { addEdge } from '@xyflow/react'
import { NODE_TYPES } from '../../../shared/constants/processing-flow.ts'

export function onConnect({ source, target, putCustomNode, setEdges }: any) {
  const updatedSourceNode = {
    ...source,
    children: [target.id],
  }

  const updatedTargetNode = {
    ...target,
    parents: [source.id],
  }

  putCustomNode(updatedSourceNode)
  putCustomNode(updatedTargetNode)

  setEdges((eds: any) => addEdge({ id: crypto.randomUUID(), source: source.id, target: target.id }, eds))

  return { source: updatedSourceNode, target: updatedTargetNode }
}

export function createInputNode({ screenToFlowPosition, setNodes, putCustomNode, event, additionalAttributes }: any) {
  return createNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    clientX: event.clientX,
    clientY: event.clientY,
    type: NODE_TYPES.UPLOAD_DOCUMENT,
    additionalAttributes: additionalAttributes,
  })
}

export function createJsonOutputNode({ screenToFlowPosition, setNodes, putCustomNode, event }: any) {
  return createNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    clientX: event.clientX,
    clientY: event.clientY,
    type: NODE_TYPES.OUTPUT_JSON,
  })
}

export function createCsvOutputNode({ screenToFlowPosition, setNodes, putCustomNode, event }: any) {
  return createNode({
    screenToFlowPosition,
    setNodes,
    putCustomNode,
    clientX: event.clientX,
    clientY: event.clientY,
    type: NODE_TYPES.OUTPUT_CSV,
  })
}

export function createNode({
  screenToFlowPosition,
  setNodes,
  putCustomNode,
  clientX,
  clientY,
  type,
  additionalAttributes,
  schema,
}: any) {
  const position = screenToFlowPosition({
    x: clientX,
    y: clientY,
  })

  const nodeId = crypto.randomUUID()

  const newNode = {
    id: nodeId,
    type,
    position,
    data: { label: `${type} node` },
  }

  setNodes((nds: any) => nds.concat(newNode))

  const customNode = {
    id: nodeId,
    type: type,
    processingFiles: [],
    additionalAttributes: additionalAttributes,
    schema: schema,
  }

  putCustomNode(customNode)

  return customNode
}
