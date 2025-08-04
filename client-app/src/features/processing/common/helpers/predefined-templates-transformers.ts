import {
  NODE_TYPES,
  TASK_CONDITIONS_TYPES,
  TASK_SERVICES,
  TASK_TYPES,
  TEMPLATES,
} from '../../../../shared/constants/processing-flow.ts'
import { getProcessingFilesFromNode } from '../../flow/helpers/files.ts'
import { CustomNode, ITask } from '../../../../types/ProcessingFlow.ts'
import { PROCESSING_MODES, PROCESSING_MODES_TYPE } from '../../../../shared/constants/processing-constants.ts'

const identityValidationTransformer =
  (tab: PROCESSING_MODES_TYPE) => (customNodes: { [nodeId: string]: CustomNode }, rootNodeId: string) => {
    const rootNode = customNodes[rootNodeId]
    const processingNodeId = rootNode.children?.[0]

    const inputTaskId = crypto.randomUUID()
    const processingTaskId = crypto.randomUUID()
    const outputTaskId = crypto.randomUUID()
    const embeddingTaskId = crypto.randomUUID()

    const determineDocumentsStartTaskId = crypto.randomUUID()
    const determineDocumentsProcessingTaskId = crypto.randomUUID()
    const determineDocumentsFinishTaskId = crypto.randomUUID()

    if (!processingNodeId) {
      throw new Error('Processing flow is not valid. Root node has no children')
    }

    const processingTextNode = customNodes[processingNodeId]

    const outputTextNodeId = processingTextNode?.children?.[0]

    if (!outputTextNodeId) {
      throw new Error('Processing flow is not valid. Output node is not found')
    }

    const outputTextNode = customNodes[outputTextNodeId]

    const validationNodeId = outputTextNode.children?.[0]

    if (!validationNodeId) {
      throw new Error('Processing flow is not valid. Validation node is not found')
    }

    const validationNode = customNodes[validationNodeId]

    const outputValidationNodeId = validationNode.children?.[0]

    const processingFilesItems = getProcessingFilesFromNode(rootNode)

    if (!processingFilesItems || processingFilesItems?.length === 0) {
      throw new Error('Processing flow is not valid. No files found')
    }

    const inputTask: ITask = {
      Type: TASK_TYPES.TASK,
      Service: TASK_SERVICES.START,
      Condition: TASK_CONDITIONS_TYPES.INITIALIZED,
      Payload: {
        taskId: outputTextNodeId,
        tab: PROCESSING_MODES.TEXT,
      },
      Next: processingTaskId,
      StartAt: true,
    }

    const processingTask: ITask = {
      Type: TASK_TYPES.TASK,
      Service: TASK_SERVICES.EXTRACT_TEXT,
      Condition: TASK_CONDITIONS_TYPES.INITIALIZED,
      Payload: {
        bedrockModelConfig: {
          bedrockModelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
        },
      },
      Next: embeddingTaskId,
    }

    const embeddingTask: ITask = {
      Type: TASK_TYPES.TASK,
      Service: TASK_SERVICES.SAVE_EMBEDDING,
      Condition: TASK_CONDITIONS_TYPES.INITIALIZED,
      Next: outputTaskId,
    }

    const outputTask: ITask = {
      Type: TASK_TYPES.TASK,
      Service: TASK_SERVICES.FINISH,
      Condition: TASK_CONDITIONS_TYPES.INITIALIZED,
    }

    const template = {
      [inputTaskId]: inputTask,
      [processingTaskId]: processingTask,
      [embeddingTaskId]: embeddingTask,
      [outputTaskId]: outputTask,
    }

    const identityValidationNode = Object.values(customNodes).find(
      (node) => node.type === NODE_TYPES.IDENTITY_VALIDATION,
    )

    const determineDocumentsStartTask = {
      Type: TASK_TYPES.TASK,
      Service: TASK_SERVICES.DETERMINE_DOCUMENTS_RAG,
      Condition: TASK_CONDITIONS_TYPES.INITIALIZED,
      Payload: {
        taskId: outputValidationNodeId,
        tab,
        schema: identityValidationNode?.schema,
      },
      Next: determineDocumentsProcessingTaskId,
    }

    const determineDocumentsProcessingTask = {
      Type: TASK_TYPES.TASK,
      Service: TASK_SERVICES.QA,
      Condition: TASK_CONDITIONS_TYPES.INITIALIZED,
      Payload: {
        bedrockModelConfig: {
          bedrockModelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
        },
      },
      Next: determineDocumentsFinishTaskId,
    }

    return {
      [crypto.randomUUID()]: {
        Type: TASK_TYPES.MAP,
        StartAt: true,
        Items: processingFilesItems,
        Tasks: template,
        Next: determineDocumentsStartTaskId,
      },
      [determineDocumentsStartTaskId]: determineDocumentsStartTask,
      [determineDocumentsProcessingTaskId]: determineDocumentsProcessingTask,
      [determineDocumentsFinishTaskId]: outputTask,
    }
  }

export const PREDEFINED_TEMPLATES_TRANSFORMERS = {
  [TEMPLATES.IDENTITY_VALIDATION_TEMPLATE]: identityValidationTransformer(PROCESSING_MODES.MEDICARE),
  [TEMPLATES.RENTAL_APP_TEMPLATE]: identityValidationTransformer(PROCESSING_MODES.RENTAL_APP),
}
