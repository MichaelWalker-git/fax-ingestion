import { Box, Button, Card, Stack } from '@mui/material'
import { Background, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import React, { useCallback, useContext, useRef } from 'react'
import { DnDProvider } from '../../../../context/DnDContext.tsx'
import { ProcessingFlowProvider, useProcessingFlow } from '../context/ProcessingFlowContext.tsx'
import { useFlowRunner } from '../hooks/useFlowRunner.ts'
import { PROCESSING_FLOW_SIDEPANEL_WIDTH } from '../../../../styles/constants.ts'

import { NAV } from '../../../../shared/components/Layout/config-layout.ts'
import { ProcessingFlowSidePanel } from './side-panel/ProcessingFlowSidePanel.tsx'
import { useTheme } from '@mui/material/styles'
import ProcessingFlowStyles from './ProcessingFlowStyles.tsx'
import Iconify from '../../../../shared/components/iconify'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { getTemplate } from '../../../../shared/api/actions/template.ts'
import { TEMPLATE_TYPES } from '../hooks/useFlowRunnerPolling.ts'
import CircularLoader from '../../../../shared/components/loader/CircularLoader.tsx'
import { SnackbarContext } from '../../../../context/SnackbarContext.tsx'
import { nodeTypes } from '../constants/custom-nodes.ts'

export default function ProcessingFlow() {
  return (
    <DnDProvider>
      <ReactFlowProvider>
        <ProcessingFlowProvider>
          <ProcessingFlowInner />
        </ProcessingFlowProvider>
      </ReactFlowProvider>
    </DnDProvider>
  )
}

function ProcessingFlowInner() {
  const reactFlowWrapper = useRef(null)
  const theme = useTheme()
  const { zoomIn, zoomOut } = useReactFlow()
  const { templateId } = useParams()
  const { setSnackbar } = useContext(SnackbarContext)

  const {
    onConnect,
    edges,
    onEdgesChange,
    handleEdgesDelete,
    handleNodesDelete,
    nodes,
    onNodesChange,
    onDrop,
    isRunning,
    resetProcessingFlow,
    isFilesPreprocessing,
    deserializeState,
    setIsRunning,
  } = useProcessingFlow()

  const { runProcessingFlow, setFlowDetails } = useFlowRunner()

  const { isLoading: isTemplateLoading } = useQuery(['/getTemplate', templateId], () => getTemplate(templateId!), {
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onSuccess: (templateResponse) => {
      deserializeState(templateResponse.templateReactFlow!)
      setFlowDetails({
        templateId: templateId,
        templateType: TEMPLATE_TYPES.SES_TEMPLATE,
        triggerOptions: { from: 'lisanets.pavel@gmail.com' },
        interval: 10000,
      })
      setIsRunning(true)
    },
    onError: (error) => {
      console.log('onError', error)
      setSnackbar({ text: 'Error fetching template:', severity: 'error' })
    },
  })

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  if (isTemplateLoading) {
    return (
      <Stack justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
        <CircularLoader text="Loading template..." />
      </Stack>
    )
  }

  return (
    <>
      <ProcessingFlowStyles />
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <Box width={`calc(100vw - ${NAV.W_VERTICAL}px)`} height="100vh">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            style={{ backgroundColor: '#F7F9FB' }}
            nodeTypes={nodeTypes}
            onEdgesDelete={handleEdgesDelete}
            onNodesDelete={handleNodesDelete}
            defaultEdgeOptions={{
              style: {
                stroke: theme.palette.primary.main,
                strokeWidth: 2,
                strokeDasharray: '5,5',
              },
            }}
          >
            <Background />
          </ReactFlow>
          <Stack
            direction="row"
            gap={2}
            sx={{ position: 'absolute', top: 22, right: PROCESSING_FLOW_SIDEPANEL_WIDTH + 40 }}
            alignItems="center"
          >
            <Card sx={{ p: 1 }}>
              <Button variant="text" onClick={resetProcessingFlow} startIcon={<Iconify icon="solar:restart-bold" />}>
                Reset Field
              </Button>
            </Card>
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              sx={{
                backgroundColor: 'background.paper',
                p: 1,
                borderRadius: 1,
              }}
            >
              <Button
                onClick={() => zoomIn()}
                sx={{
                  minWidth: 'unset',
                  width: 32,
                  height: 32,
                  p: 0,
                }}
              >
                <Iconify icon="eva:plus-outline" color="text.secondary" />
              </Button>
              <Button
                onClick={() => zoomOut()}
                sx={{
                  minWidth: 'unset',
                  width: 32,
                  height: 32,
                  p: 0,
                }}
              >
                <Iconify icon="eva:minus-outline" color="text.secondary" />
              </Button>
            </Stack>
            <Button
              startIcon={<Iconify icon="ic:baseline-account-tree" />}
              variant="contained"
              onClick={runProcessingFlow}
              disabled={isRunning || isFilesPreprocessing}
              sx={{ px: 2, py: 1.5 }}
            >
              Run Flow
            </Button>
          </Stack>
          <ProcessingFlowSidePanel />
        </Box>
      </div>
    </>
  )
}
