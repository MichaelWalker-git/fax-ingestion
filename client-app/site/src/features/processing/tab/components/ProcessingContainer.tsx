import { useQuery } from 'react-query'
import { getDocument } from '../../../../shared/api/actions/document.ts'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import { API_PATH_FILES } from '../../../../shared/api/paths.ts'
import { Alert, Box, Button, CircularProgress, Container, Stack, Tab, Tabs } from '@mui/material'
import BackButton from '../../../../shared/components/back-button/BackButton.tsx'
import CustomBreadcrumbs from '../../../../shared/components/custom-breadcrumbs'
import { ROOT_PATH } from '../../../../shared/constants/routes.ts'
import Iconify from '../../../../shared/components/iconify'
import { StyledIcon } from '../../../../shared/components/Layout/navigation/nav-section/vertical/styles.ts'
import SvgColor from '../../../../shared/components/svg-color'
import { use, useState } from 'react'
import CustomHorizontalStepper from '../../../../shared/components/stepper/CustomHorizontalStepper/CustomHorizontalStepper.tsx'
import { getSchema, steps } from '../utils/utils.tsx'
import { ProcessingContext } from '../context/ProcessingContext.tsx'
import { PROCESSING_MODES } from '../../../../shared/constants/processing-constants.ts'
import {
  runProcessing,
  runProcessingRag,
  runProcessingRagMultiFile,
  runProcessingRagTextExtraction,
  runProcessingRagTextExtractionMultiFile,
} from '../../../../shared/api/actions/processing.ts'
import { useNavigate } from 'react-router-dom'
import DocumentOverview from '../../../documents/components/DocumentOverview.tsx'

const PROCESSING_VIEWS = {
  PROCESSING: 'PROCESSING',
  OVERVIEW: 'OVERVIEW',
  HISTORY: 'HISTORY',
}

export const TABS = [
  { value: PROCESSING_VIEWS.PROCESSING, label: 'Processing', icon: 'processed' },
  { value: PROCESSING_VIEWS.OVERVIEW, label: 'Overview', icon: 'ic_insert_drive_file' },
] as const

interface ProcessingManagerProps {
  documentId: string
}

export default function ProcessingContainer({ documentId }: ProcessingManagerProps) {
  const navigate = useNavigate()
  const [view, setView] = useState(PROCESSING_VIEWS.PROCESSING)
  const [isFullScreen, setIsFullScreen] = useState(true)

  const {
    parentDocument,
    setParentDocument,
    disabledNextStep,
    mode,
    prompt,
    tableSchema,
    formSchema,
    setProcessingError,
    setIsRunning,
    setIsProcessingStarting,
    selectAll,
    setProcessingDocument,
    selectedPages,
  } = use(ProcessingContext)

  const {
    isLoading,
    error,
    data: document,
  } = useQuery<IDocumentType>(`${API_PATH_FILES}/${documentId}`, () => getDocument(documentId!), {
    onSuccess: (data) => {
      setParentDocument?.(data)
    },
  })

  if (error) {
    return <Alert severity="error">Error loading document</Alert>
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    )
  }

  const handleNextStep = async (step: number) => {
    if (step === 2) {
      try {
        setIsProcessingStarting(true)
        setIsRunning(true)
        if (!parentDocument?.isHasChildren) {
          setProcessingDocument?.(parentDocument)
          await runProcessing({
            fileId: parentDocument?.sortKey!,
            prompt: mode === PROCESSING_MODES.QA ? prompt : undefined,
            tab: mode!,
            schema: getSchema(formSchema, tableSchema, mode),
          })
        } else if (selectAll) {
          setProcessingDocument?.(parentDocument)
          const params = {
            fileId: parentDocument?.sortKey!,
            prompt: mode === PROCESSING_MODES.QA ? prompt : undefined,
            tab: mode!,
            schema: getSchema(formSchema, tableSchema, mode),
          }
          mode === PROCESSING_MODES.TEXT
            ? await runProcessingRagTextExtraction({ ...params })
            : await runProcessingRag(params)
        } else {
          const params = {
            fileIds: selectedPages,
            prompt: mode === PROCESSING_MODES.QA ? prompt : undefined,
            tab: mode!,
            schema: getSchema(formSchema, tableSchema, mode),
          }

          const result =
            mode === PROCESSING_MODES.TEXT
              ? await runProcessingRagTextExtractionMultiFile(params)
              : await runProcessingRagMultiFile(params)

          if (result.fileSetId) {
            // @ts-ignore
            setProcessingDocument?.({ sortKey: result.fileSetId })
          }
        }
        setIsProcessingStarting(false)
      } catch (e) {
        if (e && e instanceof Error) {
          setProcessingError(e.message)
        }
      }
    }
  }

  return (
    <Container maxWidth={false}>
      <Stack direction="row" justifyContent="space-between" mb={isFullScreen ? 3 : 2}>
        <Stack direction="row" gap={5}>
          <BackButton />
          <CustomBreadcrumbs
            heading={document?.filename}
            links={isFullScreen ? [{ name: 'Documents', href: ROOT_PATH }, { name: document?.filename }] : []}
          />
        </Stack>
        <Stack direction="row" alignItems="flex-start" gap={2}>
          <Button
            startIcon={<Iconify icon="ic:delete" />}
            variant="soft"
            color="error"
            onClick={() => navigate(ROOT_PATH)}
          >
            Delete
          </Button>
          <Button
            startIcon={
              isFullScreen ? (
                <Iconify icon="mingcute:fullscreen-2-line" />
              ) : (
                <Iconify icon="mingcute:fullscreen-exit-2-line" />
              )
            }
            variant="soft"
            color="info"
            onClick={() => setIsFullScreen((prevState) => !prevState)}
          >
            {!isFullScreen && 'Exit'} Full Screen
          </Button>
        </Stack>
      </Stack>

      <Stack gap={5}>
        {isFullScreen && (
          <Tabs value={view} onChange={(_, newValue) => setView(newValue)}>
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="start"
                icon={
                  <StyledIcon>
                    <SvgColor src={`/assets/icons/documents/${tab.icon}.svg`} sx={{ width: 24, height: 24 }} />
                  </StyledIcon>
                }
              />
            ))}
          </Tabs>
        )}

        {view === PROCESSING_VIEWS.PROCESSING && (
          <Stack gap={5}>
            <Stack>
              <CustomHorizontalStepper
                steps={steps}
                disabledNext={disabledNextStep}
                onNextStep={handleNextStep}
                onFinish={() => navigate(ROOT_PATH)}
              />
            </Stack>
          </Stack>
        )}
        {view === PROCESSING_VIEWS.OVERVIEW && <DocumentOverview document={document} />}
      </Stack>
    </Container>
  )
}
