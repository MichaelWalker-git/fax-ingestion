import { useDeleteDocument, useFetchDocuments } from '../api/actions/processing-results.ts';
import { Container, Tab, Tabs, TextField, InputAdornment, Box } from '@mui/material';
import PageHeader from '../../../shared/components/page-header/page-header.tsx';
import ResultsTable from '../components/results-table/ResultsTable.tsx';
import { useTable } from '../../../shared/components/table/index.ts';
import { ConfirmDialog } from '../../../shared/components/custom-dialog';
import Button from '@mui/material/Button';
import { useSnackbar } from 'notistack';
import { DEFAULT_ROWS_PER_PAGE, TABS } from '../constants/table.ts';
import { alpha, useTheme } from '@mui/material/styles';
import Iconify from '../../../shared/components/iconify';
import { useEffect, useState, useCallback } from 'react';
import { useBoolean } from '../../../hooks/use-boolean.ts';
import Stack from '@mui/material/Stack';

export default function ProcessingResultsListView() {
  const theme = useTheme();

  const confirm = useBoolean();

  const [filters, setFilters] = useState<Record<string, string | undefined>>({
    reviewStatus: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [useOpenSearch, setUseOpenSearch] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument(
    () => {
      enqueueSnackbar('Document deleted successfully', { variant: 'success' });
      setDocumentToDelete(undefined);
    },
    (error) => {
      enqueueSnackbar(error.message, { variant: 'error' });
      setDocumentToDelete(undefined);
    }
  );
  const [documentToDelete, setDocumentToDelete] = useState<string | undefined>();

  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  // Move useFetchDocuments hook before handlers that use refetch
  const {
    data: processingResults,
    isLoading,
    error,
    refetch,
  } = useFetchDocuments(
    table.rowsPerPage || DEFAULT_ROWS_PER_PAGE,
    filters.reviewStatus === 'all' ? undefined : filters.reviewStatus,
    useOpenSearch ? undefined : table.getTokenForPage(table.page), // Use DynamoDB pagination when not sorting
    useOpenSearch ? undefined : table.order, // Use DynamoDB order when not sorting
    // OpenSearch parameters
    useOpenSearch ? table.orderBy : undefined,
    useOpenSearch ? table.order : undefined,
    searchQuery || undefined,
    useOpenSearch ? table.page * (table.rowsPerPage || DEFAULT_ROWS_PER_PAGE) : undefined
  );

  const handleDelete = () => {
    if (documentToDelete) {
      deleteDocument(documentToDelete);
      confirm.onFalse();
    }
  };

  // Handle search with debouncing
  const handleSearch = useCallback(
    (search: string) => {
      setSearchQuery(search);
      setUseOpenSearch(!!search || !!table.orderBy);
      table.onResetPage();

      // Trigger refetch with new search
      refetch();
    },
    [table, refetch]
  );

  // Watch for table sort changes and trigger OpenSearch
  useEffect(() => {
    if (table.orderBy) {
      setUseOpenSearch(true);
      table.onResetPage();
      refetch();
    }
  }, [table.orderBy, table.order, refetch]);

  const handleFilterStatus = (_event: React.SyntheticEvent, newValue: string) => {
    setFilters((prevState) => ({
      ...prevState,
      reviewStatus: newValue,
    }));
    table.onResetPage();
  };

  useEffect(() => {
    if (processingResults) {
      if (processingResults.lastEvaluatedKey) {
        table.setLastEvaluatedKey(processingResults.lastEvaluatedKey);
        table.pushPageToken(table.page + 1, processingResults.lastEvaluatedKey);
      } else {
        table.setLastEvaluatedKey(undefined);
      }
    }

    table.setTotalRows(processingResults?.total || 0);
    table.setHasMore(!!processingResults?.hasMore);
  }, [processingResults]);

  return (
    <Container sx={{ paddingTop: '0 !important', paddingBottom: '0 !important' }}>
      <PageHeader>Document Processing Results</PageHeader>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
        sx={{ p: 1 }}
      >
        <Tabs
          value={filters.reviewStatus}
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
                <Iconify icon={tab.icon} width={24} height={24} sx={{ color: 'text.secondary' }} />
              }
            />
          ))}
        </Tabs>
        <Box flex={0.6}>
          <TextField
            fullWidth
            placeholder="Search files, patient names..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
              endAdornment: !!searchQuery && (
                <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                  <Iconify icon="system-uicons:cross" onClick={() => handleSearch('')} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Stack>

      <ResultsTable
        table={table}
        isLoading={isLoading}
        error={error}
        documents={processingResults?.items || []}
        onDelete={(id) => {
          confirm.onTrue();
          setDocumentToDelete(id);
        }}
        documentToDelete={isDeleting ? documentToDelete : undefined}
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setDocumentToDelete(undefined);
        }}
        title="Delete"
        content={<>Are you sure want to delete the document?</>}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete();
            }}
          >
            Delete
          </Button>
        }
      />
    </Container>
  );
}
