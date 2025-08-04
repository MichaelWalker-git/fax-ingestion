import { useCallback } from 'react'
import { runProcessingTemplate } from '../../../../shared/api/actions/processing.ts'
import { useProcessingFlow } from '../context/ProcessingFlowContext.tsx'
import { useSnackbar } from '../../../../context/SnackbarContext.tsx'
import { ProcessingFlowError } from '../../../../utils/custom-errors/ProcessingFlowError.ts'
import { transformCustomNodesToTemplate } from '../../common/helpers/transformers.ts'
import { ProcessingFlowTemplate } from '../../../../types/ProcessingFlow.ts'
import { PREDEFINED_TEMPLATES_TRANSFORMERS } from '../../common/helpers/predefined-templates-transformers.ts'
import { NODE_TYPES, TASK_TYPES } from '../../../../shared/constants/processing-flow.ts'
import { saveTemplate } from '../../../../shared/api/actions/template.ts'
import { TEMPLATE_TYPES, useFlowRunnerPolling } from './useFlowRunnerPolling.ts'

export function useFlowRunner() {
  const {
    customNodes,
    rootNodeId,
    putCustomNode,
    setIsRunning,
    // setError,
    predefinedTemplateType,
    serializeState,
  } = useProcessingFlow()
  const { setSnackbar } = useSnackbar()

  const { setFlowDetails } = useFlowRunnerPolling()

  const runProcessingFlow = useCallback(async () => {
    try {
      if (!rootNodeId) {
        throw new Error('There is no root input node')
      }

      const rootNode = customNodes[rootNodeId]

      const inputTaskId = crypto.randomUUID()

      setIsRunning(true)

      let template: any

      if (predefinedTemplateType && PREDEFINED_TEMPLATES_TRANSFORMERS[predefinedTemplateType]) {
        const transformerFunc = PREDEFINED_TEMPLATES_TRANSFORMERS[predefinedTemplateType]
        template = transformerFunc(customNodes, rootNodeId)
      } else {
        template = await transformCustomNodesToTemplate(customNodes, rootNode, inputTaskId, true)
      }

      if (!template) {
        throw new Error('Template is empty')
      }

      let templateRequest: {
        template: ProcessingFlowTemplate
        triggerOnEmail?: boolean
        triggerOnOptions?: any[]
        name: string
        templateReactFlow?: string
      }

      let response: any

      if (rootNode.type === NODE_TYPES.EMAIL_TRIGGER) {
        templateRequest = {
          template: {
            Tasks: {
              [crypto.randomUUID()]: {
                Type: TASK_TYPES.MAP,
                Items: [],
                StartAt: true,
                Tasks: template,
              },
            },
          },
          //  triggerOnEmail: true,
          triggerOnOptions: [
            {
              from: rootNode.trigger?.from,
              processBody: false,
              processAttachments: true,
              attachmentContentTypes: rootNode.trigger?.attachmentFormats,
              active: true,
              name: `New trigger ${new Date().toLocaleString()}`,
            },
          ],
          name: `New template ${new Date().toLocaleString()}`,
          templateReactFlow: serializeState(),
        }

        response = await saveTemplate(templateRequest)
        setFlowDetails({
          templateId: response.templateId,
          templateType: TEMPLATE_TYPES.SES_TEMPLATE,
          triggerOptions: { from: rootNode.trigger?.from },
        })
      } else {
        templateRequest = { template: { Tasks: template }, name: `New template ${new Date().toLocaleString()}` }
        response = (await runProcessingTemplate(templateRequest)) as { templateId: string }
        setFlowDetails({ templateId: response.templateId, templateType: TEMPLATE_TYPES.SIMPLE_TEMPLATE })
      }
    } catch (error) {
      if (error instanceof ProcessingFlowError && error.data?.nodeId) {
        const currentNode = customNodes[error.data?.nodeId]

        putCustomNode({
          ...currentNode,
          validationError: error.message,
        })
        console.log(error.data)
      }

      console.error(error)
      setIsRunning(false)
      setSnackbar({ text: (error as Error).message || 'Error running processing flow', severity: 'error' })
    }
  }, [
    customNodes,
    rootNodeId,
    putCustomNode,
    setSnackbar,
    setIsRunning,
    predefinedTemplateType,
    setFlowDetails,
    serializeState,
  ])

  return { runProcessingFlow, setFlowDetails }
}
