import { CHOICES } from '../../flow/components/custom-nodes/QuestionAnsweringChoiceNode.tsx'
import { PROCESSING_MODES } from '../../../../shared/constants/processing-constants.ts'
import {
  NODE_TYPES,
  TASK_CONDITIONS_TYPES,
  TASK_SERVICES,
  TASK_TYPES,
} from '../../../../shared/constants/processing-flow.ts'
import { CustomNode, IMap, IProcessingFlowTask, ITask } from '../../../../types/ProcessingFlow.ts'
import { IFormSchema, ITableSchema } from '../../../../types/Scema.ts'
import { ProcessingFlowError } from '../../../../utils/custom-errors/ProcessingFlowError.ts'
import { findClosestInputNodeData } from '../../flow/context/custom-nodes.ts'
import { getProcessingFilesFromNode } from '../../flow/helpers/files.ts'

export async function transformCustomNodesToTemplate(
  customNodes: { [nodeId: string]: CustomNode },
  rootNode: CustomNode,
  inputTaskId: string,
  isRootCall?: boolean,
): Promise<IProcessingFlowTask> {
  let tasks: IProcessingFlowTask | undefined

  if (!rootNode.children || rootNode.children.length === 0) {
    throw new Error('Processing flow is not valid. Root node has no children')
  }

  if (rootNode.children.length === 1) {
    const processingNodeId = rootNode.children?.[0]!
    const processingNode = customNodes[processingNodeId]
    tasks = await createTasks(customNodes, processingNode, inputTaskId, isRootCall)
  } else {
    tasks = await createParallelTasks(customNodes, rootNode, inputTaskId)
  }

  return tasks
}

async function createTasks(
  customNodes: { [nodeId: string]: CustomNode },
  processingNode: CustomNode,
  inputTaskId: string,
  isRootCall?: boolean,
): Promise<IProcessingFlowTask> {
  const nodeType = processingNode.type

  return nodeType === NODE_TYPES.QUESTION_ANSWERING_CHOICE
    ? await createChoiceTasks(customNodes, processingNode, inputTaskId)
    : await createSimpleTasks(customNodes, processingNode, inputTaskId, isRootCall)
}

async function createChoiceTasks(
  customNodes: { [nodeId: string]: CustomNode },
  processingNode: CustomNode,
  inputTaskId: string,
): Promise<IProcessingFlowTask> {
  if (!processingNode.choiceChildren) {
    throw new ProcessingFlowError('Choice node dosn`t have choiceChildren', { nodeId: processingNode.id })
  }

  const processingTaskId = crypto.randomUUID()
  const choiceTaskId = crypto.randomUUID()
  const leftTaskId = crypto.randomUUID()
  const rightTaskId = crypto.randomUUID()

  if (!processingNode.prompt) {
    throw new ProcessingFlowError('Prompt is required', { nodeId: processingNode.id })
  }

  const parentInputNode = findClosestInputNodeData(processingNode.id, customNodes)

  const processingFiles = parentInputNode?.processingFiles?.[0]

  const inputTask: ITask = {
    Type: TASK_TYPES.TASK,
    Service: TASK_SERVICES.START,
    Condition: TASK_CONDITIONS_TYPES.INITIALIZED,
    StartAt: true,
    Payload: {
      fileId: processingFiles?.fileId,
      filename: processingFiles?.name,
      prompt: processingNode.prompt,
      tab: PROCESSING_MODES.QA_CHOICE,
      choiceId: processingNode.id,
    },
    Next: processingTaskId,
  }

  const processingTask = {
    Type: TASK_TYPES.TASK,
    Service: TASK_SERVICES.QA_CHOICE,
    Condition: TASK_CONDITIONS_TYPES.INITIALIZED,
    Payload: {
      bedrockModelConfig: {
        bedrockModelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      },
    },
    Next: choiceTaskId,
  }

  const choiceTask = {
    Type: TASK_TYPES.CHOICE,
    True: leftTaskId,
    False: rightTaskId,
  }

  const leftChildId = processingNode.choiceChildren[CHOICES.YES]
  const rightChildId = processingNode.choiceChildren[CHOICES.NO]

  const leftChild = customNodes[leftChildId[0]]
  const rightChild = customNodes[rightChildId[0]]

  const leftTask = await createSimpleTasks(customNodes, leftChild, leftTaskId, false, processingNode.id)
  const rightTask = await createSimpleTasks(customNodes, rightChild, rightTaskId, false, processingNode.id)

  // @ts-ignore
  return {
    [inputTaskId]: inputTask,
    [processingTaskId]: processingTask,
    [choiceTaskId]: choiceTask,
    ...leftTask,
    ...rightTask,
  }
}

async function createSimpleTasks(
  customNodes: { [nodeId: string]: CustomNode },
  processingNode: CustomNode,
  inputTaskId: string,
  isRootCall?: boolean,
  choiceId?: string,
): Promise<IProcessingFlowTask> {
  const nodeType = processingNode.type

  if (nodeType === NODE_TYPES.UPLOAD_DOCUMENT) {
    return await transformCustomNodesToTemplate(customNodes, processingNode, inputTaskId)
  }

  const processingTaskId = crypto.randomUUID()
  const outputTaskId = crypto.randomUUID()
  const parentInputNode = findClosestInputNodeData(processingNode.id, customNodes)

  const inputNodePayload = nodePayloadConverters[nodeType](processingNode)
  const outputNodeId = processingNode.children?.[0]

  const outputNode = outputNodeId ? customNodes[outputNodeId] : undefined

  if (!outputNode) {
    throw new Error('Processing flow is not valid. Output node is not found')
  }

  const processingFiles = parentInputNode?.processingFiles

  const isMultipleFiles = (processingFiles?.length ?? 0) > 1 || !!parentInputNode?.childrenPages?.length

  const processingFile = !isMultipleFiles ? processingFiles?.[0] : undefined

  const inputTask: ITask = {
    Type: TASK_TYPES.TASK,
    Service: TASK_SERVICES.START,
    Condition: TASK_CONDITIONS_TYPES.INITIALIZED,
    Payload: {
      ...inputNodePayload,
      fileId: processingFile?.fileId,
      filename: processingFile?.name,
      taskId: outputNode.id,
      outputFileName: outputNode.outputFileName,
      choiceId,
    },
    Next: processingTaskId,
    StartAt: isRootCall,
  }

  const processingTask: ITask = {
    Type: TASK_TYPES.TASK,
    Service: nodeTypeServiceMapping[processingNode.type],
    Condition: TASK_CONDITIONS_TYPES.INITIALIZED,
    Payload: {
      bedrockModelConfig: {
        bedrockModelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      },
    },
    Next: outputTaskId,
  }

  const outputTask: ITask = {
    Type: TASK_TYPES.TASK,
    Service: TASK_SERVICES.FINISH,
    Condition: TASK_CONDITIONS_TYPES.INITIALIZED,
  }

  let nextTasks: IProcessingFlowTask | undefined

  if (outputNode.children && outputNode.children.length > 0) {
    const nextInputTaskId = crypto.randomUUID()
    outputTask.Next = nextInputTaskId
    nextTasks = await transformCustomNodesToTemplate(customNodes, outputNode, nextInputTaskId)
  }

  const template = {
    [inputTaskId]: inputTask,
    [processingTaskId]: processingTask,
    [outputTaskId]: outputTask,
    ...nextTasks,
  }

  if (isMultipleFiles) {
    const processingFilesItems = getProcessingFilesFromNode(parentInputNode)

    return {
      [crypto.randomUUID()]: {
        Type: TASK_TYPES.MAP,
        StartAt: true,
        Items: processingFilesItems,
        Tasks: template,
      } as unknown as IMap,
    }
  }

  return template
}

async function createParallelTasks(
  customNodes: { [nodeId: string]: CustomNode },
  rootNode: CustomNode,
  inputTaskId: string,
): Promise<IProcessingFlowTask> {
  const childrenNodes = rootNode.children?.map((childNodeId) => customNodes[childNodeId])

  const tasks = await Promise.all(
    childrenNodes?.map(async (node) => {
      const taskId = crypto.randomUUID()
      return [await createTasks(customNodes, node, taskId, true)]
    }) || [],
  )

  return {
    [inputTaskId]: {
      Type: TASK_TYPES.PARALLEL,
      Tasks: tasks as unknown as [[Record<any, any>]],
      StartAt: true,
    },
  }
}

const nodePayloadConverters = {
  [NODE_TYPES.TEXT_EXTRACTION]: textExtractionNodePayloadConverter,
  [NODE_TYPES.FORM_EXTRACTION]: formExtractionNodePayloadConverter,
  [NODE_TYPES.TABLE_EXTRACTION]: tableExtractionNodePayloadConverter,
  [NODE_TYPES.QUESTION_ANSWERING]: questionAnsweringNodePayloadConverter,
  [NODE_TYPES.OUTPUT_CSV]: outputCSVNodeConverter,
  [NODE_TYPES.OUTPUT_JSON]: outputJSONNodeConverter,
}

const nodeTypeServiceMapping = {
  [NODE_TYPES.TEXT_EXTRACTION]: TASK_SERVICES.EXTRACT_TEXT,
  [NODE_TYPES.FORM_EXTRACTION]: TASK_SERVICES.EXTRACT_FORM,
  [NODE_TYPES.TABLE_EXTRACTION]: TASK_SERVICES.EXTRACT_TABLE,
  [NODE_TYPES.QUESTION_ANSWERING]: TASK_SERVICES.QA,
  [NODE_TYPES.QUESTION_ANSWERING_CHOICE]: TASK_SERVICES.QA_CHOICE,
  [NODE_TYPES.OUTPUT_CSV]: TASK_SERVICES.FINISH,
  [NODE_TYPES.OUTPUT_JSON]: TASK_SERVICES.FINISH,
}

function textExtractionNodePayloadConverter(_: CustomNode) {
  return {
    tab: PROCESSING_MODES.TEXT,
  }
}

function formExtractionNodePayloadConverter(node: CustomNode) {
  const schema = node.schema as IFormSchema
  const isValid = schema?.fields.filter((field) => !!field.fieldName).length > 0

  return {
    tab: PROCESSING_MODES.FORM,
    schema: isValid ? schema : undefined,
  }
}

function tableExtractionNodePayloadConverter(node: CustomNode) {
  return {
    tab: PROCESSING_MODES.TABLE,
    schema: node.schema as ITableSchema,
  }
}

function questionAnsweringNodePayloadConverter(node: CustomNode) {
  if (!node.prompt) {
    throw new ProcessingFlowError('Prompt is required', { nodeId: node.id })
  }

  return {
    tab: PROCESSING_MODES.QA,
    prompt: node.prompt,
  }
}

function outputCSVNodeConverter(_: CustomNode) {
  return {}
}

function outputJSONNodeConverter(_: CustomNode) {
  return {}
}
