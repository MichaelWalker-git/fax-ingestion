import { Connection, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react'
import React, { Dispatch, SetStateAction } from 'react'
import { CHOICE_ANSWER_TYPE } from '../features/processing/flow/components/custom-nodes/QuestionAnsweringChoiceNode.tsx'
import {
  NODE_TYPE,
  NODE_TYPES,
  TASK_CONDITIONS_TYPES,
  TASK_SERVICES,
  TASK_TYPES,
} from '../shared/constants/processing-flow.ts'
import { IDocumentType } from './DocumentType.ts'
import { IFormSchema, ITableSchema } from './Scema.ts'
import { UploadedFile } from './File.ts'
import { EmailTriggerResult } from './EmailTrigger.ts'

export interface CustomNode {
  type: NODE_TYPE
  id: string
  parents?: string[]
  children?: string[]
  choiceChildren?: { [key: CHOICE_ANSWER_TYPE]: string[] }
  schema?: IFormSchema | ITableSchema
  outputFileName?: string
  prompt?: string
  validationError?: string
  isCollapsed?: boolean
  processingFiles?: UploadedFile[]
  childrenPages?: IDocumentType[]
  trigger?: {
    from: string
    attachmentFormats?: (string | undefined)[]
  }
  additionalAttributes?: { [key: string]: any }
  template?: string
}

export type NODE_TYPES_TYPE = (typeof NODE_TYPES)[keyof typeof NODE_TYPES]
export type TASK_SERVICES_TYPE = (typeof TASK_SERVICES)[keyof typeof TASK_SERVICES]
export type TASK_TYPES_TYPE = (typeof TASK_TYPES)[keyof typeof TASK_TYPES]
export type TASK_CONDITIONS_TYPE = (typeof TASK_CONDITIONS_TYPES)[keyof typeof TASK_CONDITIONS_TYPES]
export type TASK_TYPE = typeof TASK_TYPES.TASK
export type PARALLEL_TYPE = typeof TASK_TYPES.PARALLEL
export type CHOICE_TYPE = typeof TASK_TYPES.CHOICE
export type MAP_TYPE = typeof TASK_TYPES.MAP

export interface ITask {
  Type: TASK_TYPE
  Service: TASK_SERVICES_TYPE
  Condition: TASK_CONDITIONS_TYPE
  Payload?: Record<any, any>
  Next?: string
  StartAt?: boolean
}

export interface IParallel {
  Type: PARALLEL_TYPE
  Tasks: [[Record<any, any>]]
  Next?: string
  StartAt: boolean
}

export interface IChoice {
  Type: CHOICE_TYPE
  True: string
  False: string
}

export interface IMap {
  Type: MAP_TYPE
  Service: TASK_SERVICES_TYPE
  Payload: [Record<any, any>]
  Next?: string
  StartAt: boolean
  Items?: { fileId: string }[]
  Tasks?: IProcessingFlowTask
}

export type IProcessingFlowTask = Record<string, ITask | IParallel | IChoice | IMap>

export interface ProcessingFlowTemplate {
  Tasks: IProcessingFlowTask
}

export interface IProcessingFlowContext {
  customNodes: { [nodeId: string]: CustomNode }
  putCustomNode: (node: CustomNode) => void
  getCustomNode: (nodeId: string) => CustomNode | undefined
  removeCustomNode: (nodeId: string) => void
  getParentInputNode: (nodeId: string) => CustomNode | null
  rootNodeId?: string
  setRootNodeId: (nodeId: string | undefined) => void
  onConnect: (connection: Connection) => void
  edges: Edge[]
  onEdgesChange: (edges: EdgeChange<Edge>[]) => void
  handleEdgesDelete: (edgesToDelete: Edge[]) => void
  handleNodesDelete: (nodesToDelete: Node[]) => void
  nodes: Node[]
  onNodesChange: (nodes: NodeChange<Node>[]) => void
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  runProcessingFlow: () => void
  processingResults?: IDocumentType[]
  emailTriggerResults?: EmailTriggerResult[]
  setProcessingResults: (processingResults: IDocumentType[]) => void
  isRunning: boolean
  setIsRunning: (isRunning: boolean) => void
  isFilesPreprocessing: boolean
  setIsFilesPreprocessing: (isRunning: boolean) => void
  currentProcessingResult?: IDocumentType | undefined
  setCurrentProcessingResult: (currentProcessingResult: IDocumentType | undefined) => void
  error?: string
  setError: (error: string) => void
  resetProcessingFlow: () => void
  selectedEmailAttachments: string[]
  setSelectedEmailAttachments: (selectedEmailAttachments: string[]) => void
  getRootNode: () => CustomNode | undefined
  predefinedTemplateType?: string
  setPredefinedTemplateType: (predefinedTemplateType: string | undefined) => void
  serializeState: () => string
  deserializeState: (state: string) => void
  setEmailTriggerResults: (emailTriggerResults: EmailTriggerResult[]) => void
  enableSampleDocuments?: boolean
  setEnableSampleDocuments: Dispatch<SetStateAction<boolean>>
}
