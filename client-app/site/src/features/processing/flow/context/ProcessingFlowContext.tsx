import { Connection, Edge, Node, addEdge, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react'
import React, { ReactNode, createContext, useCallback, useContext, useState, useEffect } from 'react'
import { CustomNode, IProcessingFlowContext } from '../../../../types/ProcessingFlow.ts'

import { INPUT_NODE_TYPES, TEMPLATE_TYPE, TEMPLATES } from '../../../../shared/constants/processing-flow.ts'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import { PROCESSING_INITIAL_STATE } from '../../common/helpers/constants.ts'
import { validateConnections } from '../../common/helpers/validation.ts'
import { useDnD } from '../../../../context/DnDContext.tsx'
import { useSnackbar } from '../../../../context/SnackbarContext.tsx'
import { findClosestInputNodeData } from './custom-nodes.ts'
import { EmailTriggerResult } from '../../../../types/EmailTrigger.ts'
import useAuthUser from '../../../../shared/hooks/useAuthUser.ts'
import { isOlder } from '../../../../utils/date.ts'
import { createsFlowFromTemplate } from '../../../../context/helpers/templates'

export const ProcessingFlowContext = createContext<IProcessingFlowContext>(PROCESSING_INITIAL_STATE)

const initialNodes: Node[] = []

export function ProcessingFlowProvider({ children }: { children: ReactNode }) {
  const { userAttributes } = useAuthUser()
  const { setSnackbar } = useSnackbar()
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const { screenToFlowPosition } = useReactFlow()
  const [type] = useDnD()

  const [customNodes, setCustomNodes] = useState<{ [nodeId: string]: CustomNode }>({})
  const [rootNodeId, setRootNodeId] = useState<string | undefined>(undefined)

  const [processingResults, setProcessingResults] = useState<IDocumentType[] | undefined>(undefined)
  const [emailTriggerResults, setEmailTriggerResults] = useState<EmailTriggerResult[] | undefined>(undefined)
  const [isRunning, setIsRunning] = useState(false)
  const [isFilesPreprocessing, setIsFilesPreprocessing] = useState(false)
  const [predefinedTemplateType, setPredefinedTemplateType] = useState<TEMPLATE_TYPE | undefined>(undefined)
  const [currentProcessingResult, setCurrentProcessingResult] = useState<IDocumentType | undefined>(undefined)
  const [error, setError] = useState<string | undefined>()

  const [enableSampleDocuments, setEnableSampleDocuments] = useState(false)

  const [selectedEmailAttachments, setSelectedEmailAttachments] = useState<string[]>([])

  useEffect(() => {
    if (userAttributes?.['custom:createdAt']) {
      const userCreatedAt = new Date(userAttributes['custom:createdAt'])
      const isNewUser = !isOlder(new Date(userCreatedAt), 7)
      setEnableSampleDocuments(isNewUser)
    }
  }, [userAttributes])

  const putCustomNode = useCallback((node: CustomNode) => {
    setCustomNodes((prevState) => ({ ...prevState, [node.id]: node }))
  }, [])

  const getCustomNode = useCallback(
    (nodeId: string) => {
      return customNodes[nodeId]
    },
    [customNodes],
  )

  const removeCustomNode = useCallback((nodeId: string) => {
    setCustomNodes((prevState) => {
      const newState = { ...prevState }
      delete newState[nodeId]
      return newState
    })
  }, [])

  const getParentInputNode = useCallback(
    (nodeId: string) => {
      return findClosestInputNodeData(nodeId, customNodes)
    },
    [customNodes],
  )

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = getCustomNode(params.source)
      const targetNode = getCustomNode(params.target)
      const validationError = validateConnections(params, customNodes, rootNodeId)

      if (validationError) {
        setSnackbar({
          text: validationError,
          severity: 'error',
        })
        return
      }

      if (INPUT_NODE_TYPES.includes(sourceNode.type)) {
        if (!rootNodeId) {
          setRootNodeId(sourceNode.id)
        }
      }

      const updatedSourceNode = {
        ...sourceNode,
        children: sourceNode.children ? [...sourceNode.children, targetNode.id] : [targetNode.id],
      }

      if (params.sourceHandle) {
        updatedSourceNode.choiceChildren = updatedSourceNode.choiceChildren?.[params.sourceHandle]
          ? {
              ...updatedSourceNode.choiceChildren,
              [params.sourceHandle]: [...updatedSourceNode.choiceChildren[params.sourceHandle], targetNode.id],
            }
          : { ...updatedSourceNode.choiceChildren, [params.sourceHandle]: [targetNode.id] }
      }

      const updatedTargetNode = {
        ...targetNode,
        parents: targetNode.parents ? [...targetNode.parents, sourceNode.id] : [sourceNode.id],
      }

      putCustomNode(updatedSourceNode)
      putCustomNode(updatedTargetNode)

      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges, getCustomNode, putCustomNode, setSnackbar, rootNodeId, customNodes],
  )

  const handleEdgesDelete = useCallback(
    (edges: Edge[]) => {
      edges.forEach((edge) => {
        const sourceNode = getCustomNode(edge.source)
        const targetNode = getCustomNode(edge.target)

        if (!sourceNode || !targetNode) {
          return
        }

        let updatedSourceNode = {
          ...sourceNode,
          children: sourceNode.children?.filter((id) => id !== targetNode.id),
        }

        if (edge.sourceHandle) {
          updatedSourceNode = {
            ...updatedSourceNode,
            choiceChildren: updatedSourceNode.choiceChildren?.[edge.sourceHandle]
              ? {
                  ...sourceNode.choiceChildren,
                  [edge.sourceHandle]: updatedSourceNode.choiceChildren[edge.sourceHandle].filter(
                    (id) => id !== targetNode.id,
                  ),
                }
              : updatedSourceNode.choiceChildren,
          }
        }

        const updatedTargetNode = {
          ...targetNode,
          parents: targetNode.parents?.filter((id) => id !== sourceNode.id),
        }

        putCustomNode(updatedSourceNode)
        putCustomNode(updatedTargetNode)

        if (INPUT_NODE_TYPES.includes(sourceNode.type) && rootNodeId === sourceNode.id) {
          setRootNodeId(undefined)
        }
      })
    },
    [getCustomNode, putCustomNode, rootNodeId],
  )

  const handleNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      deletedNodes.forEach((node) => {
        removeCustomNode(node.id)
      })
    },
    [removeCustomNode],
  )

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (!type) {
        return
      }

      const isTemplate = Object.values(TEMPLATES).includes(type)

      if (isTemplate) {
        createsFlowFromTemplate({ type, screenToFlowPosition, setNodes, putCustomNode, event, setEdges, setRootNodeId })
        setPredefinedTemplateType(type)
        return
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const nodeId = crypto.randomUUID()

      const newNode = {
        id: nodeId,
        type,
        position,
        data: { label: `${type} node` },
      }

      setNodes((nds) => nds.concat(newNode))
      putCustomNode({
        id: nodeId,
        type,
        processingFiles: [],
      })
    },
    [screenToFlowPosition, type, setNodes, putCustomNode, setEdges],
  )

  const resetProcessingFlow = useCallback(() => {
    setEdges([])
    setRootNodeId(undefined)
    setProcessingResults(undefined)
    setIsRunning(false)
    setCustomNodes({})
    setError(undefined)
    setCurrentProcessingResult(undefined)
    setNodes([])
    setPredefinedTemplateType(undefined)
  }, [setEdges, setNodes])

  const getRootNode = () => {
    return rootNodeId ? customNodes[rootNodeId] : undefined
  }

  const serializeState = useCallback(() => {
    return JSON.stringify({
      nodes,
      edges,
      customNodes,
      rootNodeId,
      predefinedTemplateType,
      processingResults,
      selectedEmailAttachments,
      currentProcessingResult,
    })
  }, [
    nodes,
    edges,
    customNodes,
    rootNodeId,
    predefinedTemplateType,
    processingResults,
    selectedEmailAttachments,
    currentProcessingResult,
  ])

  const deserializeState = useCallback(
    (jsonString: string) => {
      try {
        const parsed = JSON.parse(JSON.parse(jsonString))
        setNodes(parsed.nodes || [])
        setEdges(parsed.edges || [])
        setCustomNodes(parsed.customNodes || {})
        setRootNodeId(parsed.rootNodeId)
        setPredefinedTemplateType(parsed.predefinedTemplateType)
        setProcessingResults(parsed.processingResults)
        setSelectedEmailAttachments(parsed.selectedEmailAttachments || [])
        setCurrentProcessingResult(parsed.currentProcessingResult)
      } catch (err) {
        console.error('Failed to deserialize processing flow state:', err)
        setSnackbar({
          text: 'Error loading saved processing flow',
          severity: 'error',
        })
      }
    },
    [setSnackbar, setNodes, setEdges],
  )

  return (
    <ProcessingFlowContext.Provider
      value={{
        customNodes,
        putCustomNode,
        getCustomNode,
        removeCustomNode,
        rootNodeId,
        setRootNodeId,
        onConnect,
        edges,
        // @ts-ignore
        onEdgesChange,
        handleEdgesDelete,
        handleNodesDelete,
        nodes,
        onNodesChange,
        onDrop,
        processingResults,
        setProcessingResults,
        isRunning,
        setIsRunning,
        currentProcessingResult,
        setCurrentProcessingResult,
        error,
        setError,
        resetProcessingFlow,
        selectedEmailAttachments,
        setSelectedEmailAttachments,
        getParentInputNode,
        getRootNode,
        isFilesPreprocessing,
        setIsFilesPreprocessing,
        predefinedTemplateType,
        setPredefinedTemplateType,
        serializeState,
        deserializeState,
        emailTriggerResults,
        setEmailTriggerResults,
        enableSampleDocuments,
        setEnableSampleDocuments,
      }}
    >
      {children}
    </ProcessingFlowContext.Provider>
  )
}

export const useProcessingFlow = () => {
  return useContext(ProcessingFlowContext)
}
