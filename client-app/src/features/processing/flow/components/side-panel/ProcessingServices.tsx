import { Box, Button, ButtonGroup, FormControlLabel, Stack, Typography } from '@mui/material'
import React from 'react'
import { useDnD } from '../../../../../context/DnDContext.tsx'
import SidePanelNode from './SidePanelNode.tsx'
import { TEMPLATES } from '../../../../../shared/constants/processing-flow.ts'
import Switch from '@mui/material/Switch'
import { useProcessingFlow } from '../../context/ProcessingFlowContext.tsx'

const SIDE_PANEL_MODE = {
  INPUT: 'input',
  PROCESSING: 'processing',
  OUTPUT: 'output',
}

export default function ProcessingServices() {
  const { enableSampleDocuments, setEnableSampleDocuments } = useProcessingFlow()

  const [mode, setMode] = React.useState(SIDE_PANEL_MODE.INPUT)
  const [_, setType] = useDnD()

  const handleChangeMode = (newValue: string) => {
    if (!setMode || !newValue) return

    setMode(newValue)
  }

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    setType(nodeType)
    event.dataTransfer!.effectAllowed = 'move'
  }

  return (
    <>
      <Box display="flex" justifyContent="center">
        <ButtonGroup variant="soft" color="inherit">
          <Button
            sx={mode === SIDE_PANEL_MODE.INPUT ? { color: (theme) => theme.palette.text.primary } : {}}
            onClick={() => handleChangeMode(SIDE_PANEL_MODE.INPUT)}
            className={mode === SIDE_PANEL_MODE.INPUT ? 'active-btn' : ''}
          >
            Input
          </Button>
          <Button
            className={mode === SIDE_PANEL_MODE.PROCESSING ? 'active-btn' : ''}
            onClick={() => handleChangeMode(SIDE_PANEL_MODE.PROCESSING)}
          >
            Processing
          </Button>
          <Button
            className={mode === SIDE_PANEL_MODE.OUTPUT ? 'active-btn' : ''}
            onClick={() => handleChangeMode(SIDE_PANEL_MODE.OUTPUT)}
          >
            Output
          </Button>
        </ButtonGroup>
      </Box>
      <Stack gap={1}>
        {mode === SIDE_PANEL_MODE.INPUT && (
          <Stack gap={2.5}>
            <Typography variant="body2" color="textDisabled">
              Drag the Upload Documents or Upload Archive block into the field, then upload your file to start the
              process
            </Typography>
            <SidePanelNode
              onDragStart={onDragStart}
              type="uploadDocument"
              title="Upload documents"
              subtitle=".pdf, .jpeg"
              icon={{
                isCustom: true,
                name: '/assets/icons/documents/ic_upload_file.svg',
              }}
            />
            <Typography variant="subtitle2" color="textDisabled">
              INTEGRATIONS
            </Typography>
            <Stack gap={1}>
              <SidePanelNode
                onDragStart={onDragStart}
                type="gmailReader"
                title="Gmail Reader"
                subtitle="Read and send Gmail messages"
                icon={{
                  isCustom: true,
                  name: '/assets/icons/brands/gmail.svg',
                }}
              />
            </Stack>
            <Typography variant="subtitle2" color="textDisabled">
              TRIGGERS
            </Typography>
            <Stack>
              <SidePanelNode
                onDragStart={onDragStart}
                type="emailTrigger"
                title="Email Trigger"
                subtitle="Run the flow automatically"
                icon={{
                  isCustom: true,
                  name: '/assets/icons/processing-flow/bolt.svg',
                }}
              />
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" color="textDisabled">
                TEMPLATES
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={enableSampleDocuments}
                    onChange={() => {
                      setEnableSampleDocuments((prevState: boolean) => !prevState)
                    }}
                  />
                }
                label={<Typography variant="subtitle2">Add Sample Documents</Typography>}
              />
            </Stack>
            <Stack gap={1}>
              <SidePanelNode
                onDragStart={onDragStart}
                type={TEMPLATES.IDENTITY_VALIDATION_TEMPLATE}
                title="Identity Consistency Validation"
                subtitle="Verifies all documents belong to the same individual"
                icon={{
                  isCustom: true,
                  name: '/assets/icons/processing-flow/identity.svg',
                }}
              />
              <SidePanelNode
                onDragStart={onDragStart}
                type={TEMPLATES.RENTAL_APP_TEMPLATE}
                title="Rental flow"
                subtitle="Verify your documents"
                icon={{
                  isCustom: true,
                  name: '/assets/icons/processing-flow/key.svg',
                }}
              />
              <SidePanelNode
                onDragStart={onDragStart}
                type={TEMPLATES.TEXT_EXTRACTION_TEMPLATE}
                title="Text extract"
                subtitle="Basic template of text extraction processing"
                icon={{
                  name: 'ic:baseline-notes',
                }}
              />
              <SidePanelNode
                onDragStart={onDragStart}
                type={TEMPLATES.FORM_EXTRACTION_TEMPLATE}
                title="Form extract"
                subtitle="Basic template of form extraction processing"
                icon={{
                  name: 'ic:baseline-view-agenda',
                }}
              />
              <SidePanelNode
                onDragStart={onDragStart}
                type={TEMPLATES.TABLE_EXTRACTION_TEMPLATE}
                title="Table extract"
                subtitle="Basic template of table extraction processing"
                icon={{
                  name: 'ic:baseline-calendar-view-month',
                }}
              />
            </Stack>
          </Stack>
        )}
        {mode === SIDE_PANEL_MODE.PROCESSING && (
          <>
            <SidePanelNode onDragStart={onDragStart} type="textExtraction" title="Text" subtitle="Text extraction " />
            <SidePanelNode onDragStart={onDragStart} type="formExtraction" title="Form" subtitle="Form extraction" />
            <SidePanelNode onDragStart={onDragStart} type="tableExtraction" title="Table" subtitle="Table extraction" />
            <SidePanelNode
              onDragStart={onDragStart}
              type="questionAnswering"
              title="Question"
              subtitle="Question answering"
            />
            <SidePanelNode
              onDragStart={onDragStart}
              type="questionAnsweringChoice"
              title="Question with choices"
              subtitle="Question answering with choices"
            />
          </>
        )}
        {mode === SIDE_PANEL_MODE.OUTPUT && (
          <>
            <SidePanelNode onDragStart={onDragStart} type="outputCsv" title="csv" subtitle="Comma-separated values" />
            <SidePanelNode onDragStart={onDragStart} type="outputJson" title="json" subtitle="JSON format" />
          </>
        )}
      </Stack>
    </>
  )
}
