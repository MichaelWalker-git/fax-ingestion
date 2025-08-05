import { Alert, Table, TableBody, TableContainer } from '@mui/material';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableProps,
} from '../../../../shared/components/table';

import { DOCUMENTS_TABLE_HEAD } from '../../constants/table.ts';
import TableSkeleton from '../../../../shared/components/table/table-skeleton.tsx';
import ResultsTableRow from './ResultsTableRow.tsx';
import { IDocument } from '../../../../types/IDocument.ts';
import { useNavigate } from 'react-router';
import { paths } from '../../../../routes/paths.ts';

interface DocumentsTableProps {
  table: TableProps;
  documents?: IDocument[];
  isLoading: boolean;
  error: unknown;
  onDelete: (id: string) => void;
  documentToDelete?: string;
}

export default function ResultsTable({
  table,
  documents,
  isLoading,
  error,
  onDelete,
  documentToDelete,
}: DocumentsTableProps) {
  const navigate = useNavigate();

  const visibleItemsCount = documents?.length ?? 0;

  const count =
    table.totalRows ||
    (table.lastEvaluatedKey
      ? (table.page + 2) * table.rowsPerPage // assume more pages
      : table.page * table.rowsPerPage + visibleItemsCount); // actual count on last page

  return (
    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
      <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
        <TableHeadCustom
          order={table.order}
          orderBy={table.orderBy}
          headLabel={DOCUMENTS_TABLE_HEAD}
          rowCount={documents?.length}
          onSort={table.onSort}
        />
        <TableBody>
          {documents?.map((row) => (
            <ResultsTableRow
              key={row.sortKey}
              row={row}
              onViewRow={() =>
                navigate(paths.processingResults.view.replace(':id', row.sortKey), {
                  replace: true,
                })
              }
              onDelete={onDelete}
              documentToDelete={documentToDelete}
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
        </TableBody>
      </Table>
      {error ? (
        <Alert sx={{ width: '100%', display: 'flex', justifyContent: 'center' }} severity="error">
          {(error as Error).message || 'Something went wrong'}
        </Alert>
      ) : null}
      <TablePaginationCustom
        count={count}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />
    </TableContainer>
  );
}
