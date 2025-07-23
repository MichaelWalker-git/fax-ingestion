import { Connection } from '@xyflow/react'
import { CHOICES } from '../../flow/components/custom-nodes/QuestionAnsweringChoiceNode.tsx'
import {
  INPUT_NODE_TYPES,
  NODE_TYPES,
  OUTPUT_NODE_TYPES,
  PROCESSING_NODE_TYPES,
} from '../../../../shared/constants/processing-flow.ts'
import { CustomNode } from '../../../../types/ProcessingFlow.ts'

const MAX_CHILDREN = 3
const MAX_INPUT_NODES = 3
const MAX_DEPTH = 12

export const validateConnections = (
  params: Connection,
  customNodes: { [nodeId: string]: CustomNode },
  rootNodeId?: string,
) => {
  const sourceNode = customNodes[params.source]
  const targetNode = customNodes[params.target]

  if (!sourceNode || !targetNode) {
    return 'An unexpected error occurred. Please try again.'
  }

  const isSourceInputNode = INPUT_NODE_TYPES.includes(sourceNode.type)
  const isTargetInputNode = INPUT_NODE_TYPES.includes(targetNode.type)
  const isTargetOutputNode = OUTPUT_NODE_TYPES.includes(targetNode.type)
  const isSourceOutputNode = OUTPUT_NODE_TYPES.includes(sourceNode.type)
  const isSourceProcessingNode = PROCESSING_NODE_TYPES.includes(sourceNode.type)
  const isTargetProcessingNode = PROCESSING_NODE_TYPES.includes(targetNode.type)
  const isTargetChoiceNode = targetNode.type === NODE_TYPES.QUESTION_ANSWERING_CHOICE
  const isSourceChoiceNode = sourceNode.type === NODE_TYPES.QUESTION_ANSWERING_CHOICE

  if (sourceNode.children && sourceNode.children.length >= MAX_CHILDREN) {
    return `Please limit each node to a maximum of ${MAX_CHILDREN} child nodes.`
  }

  if (isSourceInputNode) {
    if (isTargetOutputNode) {
      return 'Input nodes cannot connect directly to output nodes. Please use a processing node instead.'
    }

    if (targetNode.parents?.length) {
      return 'A processing node cannot have multiple parent nodes.'
    }

    if (isTargetInputNode) {
      return 'Connecting input nodes directly to other input nodes is not allowed.'
    }
  }

  if (isSourceChoiceNode) {
    const choiceChildren = sourceNode.choiceChildren?.[params.sourceHandle!]
    if (choiceChildren && choiceChildren.length > 0) {
      return 'Each choice can have only one child node.'
    }

    const oppositeChoice = params.sourceHandle === CHOICES.YES ? CHOICES.NO : CHOICES.YES
    const oppositeChildren = sourceNode.choiceChildren?.[oppositeChoice]
    if (oppositeChildren && oppositeChildren[0] === params.target) {
      return 'Different choices cannot lead to the same node.'
    }

    if (isTargetOutputNode) {
      return 'Choice nodes cannot connect directly to output nodes. Please use a processing node instead.'
    }
  }

  if (isSourceProcessingNode && !isSourceChoiceNode) {
    if (isTargetProcessingNode && !isTargetChoiceNode) {
      return 'Processing nodes cannot connect directly to other processing nodes.'
    }

    const ifOutputAlreadyExists = sourceNode.children?.some((child) =>
      OUTPUT_NODE_TYPES.includes(customNodes[child].type),
    )

    if (isTargetOutputNode && ifOutputAlreadyExists) {
      return 'Each processing node can only have one output node connected.'
    }
  }

  if (isSourceOutputNode && isTargetOutputNode) {
    return 'Output nodes cannot connect to other output nodes.'
  }

  if (
    isTargetOutputNode &&
    targetNode.type === NODE_TYPES.OUTPUT_CSV &&
    sourceNode.type !== NODE_TYPES.TABLE_EXTRACTION
  ) {
    return 'Csv output nodes can only be connected to table extraction nodes.'
  }

  const checkDepth = (nodeId: string, depth: number): boolean => {
    if (depth > MAX_DEPTH) return false
    const node = customNodes[nodeId]
    if (!node || !node.parents) return true
    return node.parents.every((childId) => checkDepth(childId, depth + 1))
  }

  if (!checkDepth(params.source, 1)) {
    return `Branches cannot exceed a maximum depth of ${MAX_DEPTH} nodes.`
  }

  if (isTargetInputNode && rootNodeId && countInputNodes(customNodes, rootNodeId) > MAX_INPUT_NODES - 1) {
    return `Please limit the number of input nodes to a maximum of ${MAX_INPUT_NODES}.`
  }
}

function countInputNodes(
  customNodes: { [nodeId: string]: CustomNode },
  rootNodeId: string,
  visitedNodes = new Set<string>(),
): number {
  if (visitedNodes.has(rootNodeId)) {
    return 0
  }

  visitedNodes.add(rootNodeId)

  const rootNode = customNodes[rootNodeId]
  if (!rootNode) {
    return 0
  }

  const isInputNode = INPUT_NODE_TYPES.includes(rootNode.type)
  let count = isInputNode ? 1 : 0

  if (rootNode.children) {
    for (const childId of rootNode.children) {
      count += countInputNodes(customNodes, childId, visitedNodes)
    }
  }

  return count
}
