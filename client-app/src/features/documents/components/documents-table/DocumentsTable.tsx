import { Alert, IconButton, Stack, Table, TableBody, TableContainer, Tooltip } from '@mui/material'
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableProps,
  TableSelectedAction,
  TableSkeleton,
} from '../../../../shared/components/table'
import Iconify from '../../../../shared/components/iconify'
import Scrollbar from '../../../../shared/components/scrollbar/scrollbar.tsx'
import { DOCUMENTS_TABLE_HEAD } from '../../utils/utils.tsx'
import DocumentsTableRow from './DocumentsTableRow.tsx'
import { IDocumentType } from '../../../../types/DocumentType.ts'

interface DocumentsTableProps {
  table: TableProps
  documents?: IDocumentType[]
  dataFiltered?: IDocumentType[]
  toViewDetails: (id: string) => void
  toProcessing: (id: string) => void
  handleDeleteDocument: (id: string) => void
  deletingRows: string[]
  isLoading: boolean
  error: unknown
  onConfirm: VoidFunction
}

export default function DocumentsTable({
  table,
  documents,
  dataFiltered,
  toViewDetails,
  toProcessing,
  handleDeleteDocument,
  deletingRows,
  isLoading,
  error,
  onConfirm,
}: DocumentsTableProps) {
  return (
    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
      <TableSelectedAction
        dense={table.dense}
        numSelected={table.selected.length}
        rowCount={documents?.length ?? 0}
        onSelectAllRows={(checked) => table.onSelectAllRows(checked, documents?.map((row) => row.sortKey) || [])}
        action={
          <Stack direction="row">
            <Tooltip title="Delete">
              <IconButton color="primary" onClick={onConfirm}>
                <Iconify icon="ic:delete" />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />

      <Scrollbar>
        <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
          <TableHeadCustom
            order={table.order}
            orderBy={table.orderBy}
            headLabel={DOCUMENTS_TABLE_HEAD}
            rowCount={documents?.length}
            numSelected={table.selected.length}
            onSort={table.onSort}
            onSelectAllRows={(checked) => table.onSelectAllRows(checked, documents?.map((row) => row.sortKey) || [])}
          />
          <TableBody>
            {dataFiltered
              ?.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
              .map((row) => (
                <DocumentsTableRow
                  key={row.sortKey}
                  row={row}
                  selected={table.selected.includes(row.sortKey)}
                  onSelectRow={() => table.onSelectRow(row.sortKey)}
                  onViewRow={toViewDetails}
                  onStartProcessing={toProcessing}
                  onDeleteRow={handleDeleteDocument}
                  deletingRows={deletingRows}
                />
              ))}
            {!isLoading && !error && documents?.length === 0 && (
              <TableNoData
                notFound
                imgUrl="ic_document.svg"
                title="No documents uploaded yet"
                description="Upload a file to start processing and extracting key data"
              />
            )}
            {isLoading && <TableSkeleton />}
            {error ? (
              <Alert sx={{ width: '100%', display: 'flex', justifyContent: 'center' }} severity="error">
                {(error as string) || 'Something went wrong'}
              </Alert>
            ) : null}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePaginationCustom
        count={documents?.length ?? 0}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />
    </TableContainer>
  )
}
