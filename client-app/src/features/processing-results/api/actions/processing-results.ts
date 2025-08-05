import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { API_PROCESSING_RESULTS } from '../../../../api/api-paths.ts';
import { IDocument } from '../../../../types/IDocument.ts';
import { Review } from '../../../../types/Review.ts';
import { api } from '../../../../api/api-config.ts';
import ProcessingResult from '../../../../types/ProcessingResult.ts';

export const useFetchDocuments = (
  limit: number,
  reviewStatus?: string,
  lastEvaluatedKey?: string,
  order?: string,
  // New OpenSearch parameters
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  searchQuery?: string,
  from?: number
) => {
  return useQuery({
    queryKey: [
      'processing-results',
      reviewStatus,
      limit,
      lastEvaluatedKey,
      order,
      sortBy,
      sortOrder,
      searchQuery,
      from,
    ],
    queryFn: () =>
      fetchDocuments({
        limit,
        reviewStatus,
        lastEvaluatedKey: lastEvaluatedKey ? btoa(JSON.stringify(lastEvaluatedKey)) : undefined,
        order,
        sortBy,
        sortOrder,
        searchQuery,
        from,
      }),
  });
};

const fetchDocuments = async ({
  limit,
  reviewStatus,
  lastEvaluatedKey,
  order,
  sortBy,
  sortOrder,
  searchQuery,
  from,
}: {
  limit: number;
  reviewStatus?: string;
  lastEvaluatedKey?: string;
  order?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
  from?: number;
}) => {
  const queryParams = new URLSearchParams();

  queryParams.append('limit', limit.toString());

  if (reviewStatus) queryParams.append('reviewStatus', reviewStatus);
  if (lastEvaluatedKey) queryParams.append('lastEvaluatedKey', lastEvaluatedKey);
  if (order) queryParams.append('order', order);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  if (searchQuery) queryParams.append('searchQuery', searchQuery);
  if (from !== undefined) queryParams.append('from', from.toString());

  const { body } = await api.get(`${API_PROCESSING_RESULTS}?${queryParams.toString()}`);

  const responseBody = (await body.json()) as unknown as {
    items: IDocument[];
    lastEvaluatedKey?: string;
    // New OpenSearch response fields
    total?: number;
    from?: number;
    size?: number;
    hasMore?: boolean;
  };

  return responseBody;
};

export const useFetchDocument = (id?: string) => {
  return useQuery({
    queryKey: ['processing-result', id],
    queryFn: () => fetchDocument(id || ''),
    enabled: !!id,
  });
};

const fetchDocument = async (id: string) => {
  const { body } = await api.get(`${API_PROCESSING_RESULTS}/${id}`);

  const responseBody = (await body.json()) as unknown as { item: IDocument };

  return responseBody.item;
};

export const deleteDocument = async (id: string) => {
  return await api.delete(`${API_PROCESSING_RESULTS}/${id}`);
};

let debounceTimeout: NodeJS.Timeout | null = null;

export const useDeleteDocument = (onSuccess?: VoidFunction, onFailure?: (error: Error) => void) => {
  const queryClient = useQueryClient();

  const throttledInvalidate = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['processing-results'] });
    }, 1000);
  };

  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      throttledInvalidate();
      onSuccess?.();
    },
    onError: (error: Error) => {
      onFailure?.(error);
    },
  });
};

export const useUpdateProcessingResult = (
  onSuccess?: VoidFunction,
  onFailure?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcessingResult }) =>
      updateProcessingResult(id, data),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: Error) => {
      onFailure?.(error);
    },
  });
};

export const updateProcessingResult = async (id: string, data: ProcessingResult) => {
  await api.put(`${API_PROCESSING_RESULTS}/${id}/update-processing-result`, data);
};

export const updateProcessingResultReview = async (id: string, data: Review) => {
  await api.put(`${API_PROCESSING_RESULTS}/${id}/review`, data);
};

export const useFetchProcessingResult = (url: string): UseQueryResult<ProcessingResult> => {
  return useQuery({
    queryKey: ['processing-result', url],
    queryFn: () => fetchProcessingResult(url) as Promise<ProcessingResult>,
    enabled: !!url,
  });
};

export const fetchProcessingResult = async (url: string) => {
  const result = await fetch(url!, {
    method: 'GET',
  });

  return await result.json();
};
