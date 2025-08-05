import { useMutation, useQuery } from 'react-query'
import { deleteDocument, deleteDocuments, getDocument, getDocuments } from '../../../shared/api/actions/document.ts'
import { IDocumentTableFilterValue, IDocumentType } from '../../../types/DocumentType.ts'
import { Button, Container, Stack, Tab, Tabs, Typography } from '@mui/material'
import { exportCSV, getComparator, handlePrintTable, useTable } from '../../../shared/components/table'
import BigAddButton from '../../../shared/components/big-add-button/BigAddButton.tsx'
import { useBoolean } from '../../../shared/hooks/useBoolean.ts'
import { use, useCallback, useRef, useState } from 'react'
import usePolling from '../../../shared/hooks/usePolling.ts'
import { FILE_STATUSES, FILE_UPLOAD_FROM } from '../../../shared/constants/file-constants.ts'
import { SnackbarContext } from '../../../context/SnackbarContext.tsx'
import { useNavigate } from 'react-router-dom'
import { DOCUMENT_DETAILS_PATH, PROCESSING_PATH } from '../../../shared/constants/routes.ts'
import { ConfirmDialog } from '../../../shared/components/custom-dialog'
import { alpha, useTheme } from '@mui/material/styles'
import { StyledIcon } from '../../../shared/components/Layout/navigation/nav-section/vertical/styles.ts'
import SvgColor from '../../../shared/components/svg-color'
import DocumentsTableToolbar from './documents-table/DocumentsTableToolbar.tsx'
import DocumentsTableFiltersResult from './documents-table/DocumentsTableFiltersResult.tsx'
import { applyFilter } from './documents-table/utils.ts'
import { defaultFilters, DOCUMENTS_VIEW, DocumentViewType, TABS } from '../utils/utils.tsx'
import DocumentsTable from './documents-table/DocumentsTable.tsx'
import DocumentsGrid from './documents-grid/DocumentsGrid.tsx'
import UploadFileModal from '../../../shared/components/UploadFileModal.tsx'

export default function DocumentListView() {
  const theme = useTheme()
  const { setSnackbar } = use(SnackbarContext)
  const navigate = useNavigate()

  const confirm = useBoolean()

  const tableRef = useRef<HTMLDivElement>(null)

  const {
    isLoading,
    error,
    data: documents,
    refetch,
  } = useQuery<IDocumentType[]>('/documents', () =>
    getDocuments([
      FILE_UPLOAD_FROM.MANUALLY,
      FILE_UPLOAD_FROM.SAMPLE_TABLE,
      FILE_UPLOAD_FROM.SAMPLE_TEXT,
      FILE_UPLOAD_FROM.SAMPLE_FORM,
    ]),
  )

  const notifiedDocumentsRef = useRef<Set<string>>(new Set())

  const { mutate: deleteDocumentMutate } = useMutation(deleteDocument, {
    onSuccess: () => {
      refetch()
      setSnackbar({ text: 'Document deleted successfully', severity: 'success' })
      setDeletingRows([])
    },
    onError: (error) => {
      console.error('Error deleting document:', error)
      setSnackbar({ text: 'Error deleting document:', severity: 'error' })
    },
  })

  const { mutate: deleteDocumentsMutate } = useMutation(deleteDocuments, {
    onSuccess: () => {
      refetch()
      setSnackbar({ text: 'Documents deleted successfully', severity: 'success' })
      setDeletingRows([])
    },
    onError: (error) => {
      console.error('Error deleting documents:', error)
      setSnackbar({ text: 'Error deleting documents:', severity: 'error' })
    },
  })

  const uploadModal = useBoolean()

  const table = useTable({ defaultOrderBy: 'updatedAt', defaultOrder: 'desc' })

  const handleFilters = useCallback(
    (name: string, value: IDocumentTableFilterValue) => {
      table.onResetPage()
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    },
    [table],
  )

  const [newUploadedDocuments, setNewUploadedDocuments] = useState<string[]>([])

  const [deletingRows, setDeletingRows] = useState<string[]>([])

  const [filters, setFilters] = useState(defaultFilters)

  const dataFiltered = applyFilter({
    inputData: documents,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  })

  const [view, setView] = useState<DocumentViewType>(DOCUMENTS_VIEW.TABLE)

  const getDocumentStatus = useCallback(async () => {
    const unprocessedDocumentIds = newUploadedDocuments.filter((id) => !notifiedDocumentsRef.current.has(id))
    if (unprocessedDocumentIds.length === 0) {
      return { status: FILE_STATUSES.INITIALIZED }
    }

    const results = await Promise.all(
      unprocessedDocumentIds.map(async (documentId) => {
        const responseDocument = await getDocument(documentId)
        if (responseDocument.status === FILE_STATUSES.UPLOADED) {
          setSnackbar({
            text: `Document ${responseDocument.filename} is ready to be processed`,
            severity: 'success',
            variant: 'outlined',
          })
          notifiedDocumentsRef.current.add(documentId)
          refetch()
          setNewUploadedDocuments((prev) => prev.filter((id) => id !== documentId))
          return documentId
        }
        return null
      }),
    )

    const allProcessed = results.every((id) => id !== null)

    if (allProcessed) {
      refetch()
    }

    return { status: allProcessed ? FILE_STATUSES.UPLOADED : FILE_STATUSES.INITIALIZED }
  }, [newUploadedDocuments, refetch, setSnackbar])

  usePolling({
    apiCall: getDocumentStatus,
    checkDone: (data) => data?.status === FILE_STATUSES.UPLOADED,
    interval: 2000,
    skip: newUploadedDocuments.length === 0,
  })

  const handleDeleteDocument = async (documentId: string) => {
    setDeletingRows([documentId])
    deleteDocumentMutate(documentId)
  }

  const toViewDetails = (id: string) => {
    navigate(DOCUMENT_DETAILS_PATH.replace(':id', id))
  }

  const toProcessing = (id: string) => {
    navigate(PROCESSING_PATH.replace(':id', id))
  }

  const handleDeleteRows = () => {
    setDeletingRows(table.selected)
    deleteDocumentsMutate(table.selected)
    confirm.onFalse()
    table.onSelectAllRows(false, [])
  }

  const handleFilterStatus = useCallback(
    (_event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue)
    },
    [handleFilters],
  )

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const handleExportCSV = useCallback(() => {
    exportCSV(documents ?? [], 'documents.csv')
  }, [documents])

  const canReset = !!filters.format.length || filters.status !== 'all' || !!filters.updatedAt

  return (
    <>
      <Container maxWidth={false}>
        <Stack gap={5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">Documents</Typography>
            <BigAddButton icon="ic-insert-drive-file" text="Add Document" onClick={uploadModal.onTrue} />
          </Stack>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
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
          <DocumentsTableToolbar
            filters={filters}
            onFilters={handleFilters}
            formatOptions={['PDF', 'image']}
            onExportCSV={handleExportCSV}
            onPrint={handlePrintTable(tableRef)}
            view={view}
            onChangeView={setView}
          />
          {canReset && (
            <DocumentsTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered?.length ?? 0}
              sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}
            />
          )}
          <div ref={tableRef}>
            {view === DOCUMENTS_VIEW.TABLE ? (
              <DocumentsTable
                onConfirm={confirm.onTrue}
                table={table}
                documents={documents}
                dataFiltered={dataFiltered}
                toViewDetails={toViewDetails}
                error={error}
                handleDeleteDocument={handleDeleteDocument}
                toProcessing={toProcessing}
                deletingRows={deletingRows}
                isLoading={isLoading}
              />
            ) : (
              <DocumentsGrid
                documents={dataFiltered ?? []}
                onViewRow={toViewDetails}
                onStartProcessing={toProcessing}
                onDeleteRow={handleDeleteDocument}
                table={table}
                onConfirm={confirm.onTrue}
                deletingRows={deletingRows}
              />
            )}
          </div>
          <UploadFileModal
            open={uploadModal.value}
            onClose={() => uploadModal.onFalse()}
            onUploaded={(uploadedFiles) => {
              const uploadedFileIds = uploadedFiles.map((file) => file.fileId)
              setNewUploadedDocuments(uploadedFileIds)
              notifiedDocumentsRef.current = new Set()
              refetch()
            }}
          />
        </Stack>
      </Container>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows()
              confirm.onFalse()
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  )
}
