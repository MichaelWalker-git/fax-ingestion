import { Alert, InputAdornment, TextField, Typography } from '@mui/material';
import CircularLoader from '../../../../shared/components/loader/CircularLoader.tsx';
import Stack from '@mui/material/Stack';
import { IDocument } from '../../../../types/IDocument.ts';
import {
  useFetchProcessingResult,
  useUpdateProcessingResult,
} from '../../api/actions/processing-results.ts';
import { useEffect, useMemo, useState } from 'react';
import AccuracyComponent from '../../../../shared/components/AccuracyComponent.tsx';
import Iconify from '../../../../shared/components/iconify';
import ProcessingResultField from '../processing-result-field/ProcessingResultField.tsx';
import { IProcessingResultField } from '../../../../types/ProcessingResult.ts';
import { useSnackbar } from 'notistack';

interface ProcessingResultProps {
  document: IDocument;
}

export default function ProcessingResult({ document }: ProcessingResultProps) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    data: processingResult,
    isLoading,
    error,
  } = useFetchProcessingResult(document.resultPresignedUrl);

  const [fields, setFields] = useState<IProcessingResultField[]>([]);

  const [filter, setFilter] = useState<string | undefined>();

  const [updatingFieldName, setUpdatingFieldName] = useState<string | undefined>();

  const { mutate: updateProcessingResult } = useUpdateProcessingResult(
    () => {
      enqueueSnackbar('Field value updated successfully', { variant: 'success' });
      setUpdatingFieldName(undefined);
    },
    (error) => {
      enqueueSnackbar(error.message, { variant: 'error' });
      if (processingResult) {
        setFields(processingResult.result.fields);
      }
      setUpdatingFieldName(undefined);
    }
  );

  useEffect(() => {
    if (processingResult) {
      setFields(processingResult.result.fields);
    }
  }, [processingResult]);

  const filteredFields = useMemo(() => {
    if (!processingResult) {
      return [];
    }

    if (filter) {
      return fields.filter(
        (field) =>
          field.fieldName?.toLowerCase().includes(filter.toLowerCase()) ||
          field.value?.toLowerCase().includes(filter.toLowerCase())
      );
    }

    return fields;
  }, [filter, fields]);

  const handleFieldChange = (field: IProcessingResultField) => {
    const updatedFields = fields.map((f) => (f.fieldName === field.fieldName ? field : f));
    setFields(updatedFields);
    updateProcessingResult({
      id: document.sortKey,
      data: { ...processingResult, result: { fields: updatedFields } },
    });
    setUpdatingFieldName(field.fieldName);
  };

  return (
    <>
      {error && <Alert severity="error">{error.message}</Alert>}
      {isLoading && <CircularLoader text="Loading Processing result..." />}
      {document && !processingResult && !isLoading && !error && (
        <Alert severity="warning"> There is no processing result yet </Alert>
      )}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
        sx={{ p: 1 }}
      >
        {processingResult?.accuracy !== undefined && processingResult?.accuracy !== null && (
          <AccuracyComponent text="Extraction Accuracy:" accuracy={processingResult?.accuracy} />
        )}
        {processingResult && (
          <TextField
            label="Filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ width: '40%' }}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
              endAdornment: !!filter && (
                <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                  <Iconify icon="system-uicons:cross" onClick={() => setFilter('')} />
                </InputAdornment>
              ),
            }}
          />
        )}
      </Stack>
      {processingResult && (
        <Stack gap={2} sx={{ p: 1, border: '2px dashed #ccc', borderRadius: '8px', gap: 1 }}>
          <Stack gap={2}>
            {filteredFields?.length === 0 && <Typography textAlign="center">No results</Typography>}
            {filteredFields?.map((field) => (
              <ProcessingResultField
                field={field}
                onChange={handleFieldChange}
                updating={updatingFieldName === field.fieldName}
              />
            ))}
          </Stack>
        </Stack>
      )}
    </>
  );
}
