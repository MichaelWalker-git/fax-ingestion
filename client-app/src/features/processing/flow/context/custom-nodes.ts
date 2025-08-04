import { INPUT_NODE_TYPES } from '../../../../shared/constants/processing-flow.ts'
import { CustomNode } from '../../../../types/ProcessingFlow.ts'

type NodeMap = { [id: string]: CustomNode }

export function findClosestInputNodeData(nodeId: string, allNodes: NodeMap): CustomNode | null {
  const visited = new Set<string>()
  const queue: string[] = [nodeId]

  while (queue.length > 0) {
    const currentId = queue.shift()
    if (!currentId || visited.has(currentId)) continue

    visited.add(currentId)

    const currentNode = allNodes[currentId]
    if (!currentNode) continue

    if (INPUT_NODE_TYPES.includes(currentNode.type)) {
      return currentNode
    }

    if (currentNode.parents) {
      queue.push(...currentNode.parents)
    }
  }

  return null
}
