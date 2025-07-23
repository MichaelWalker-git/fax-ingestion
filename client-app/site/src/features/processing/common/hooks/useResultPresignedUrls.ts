import { useQuery } from 'react-query'
import { fetchResultPresignedUrl } from '../../../../shared/api/actions/presign.ts'
import { ProcessingResult } from '../../../../types/ProcessingResults.ts'
import { IDocumentType } from '../../../../types/DocumentType.ts'

export function useResultPresignedUrls({
  processingDocumentResults,
}: { processingDocumentResults: ProcessingResult[] | IDocumentType[] }) {
  const { data: presignedUrls, isLoading: loadingPresigned } = useQuery(
    [`result-presigned-url-${processingDocumentResults.map((document) => document.resultS3Path).join('-')}`],
    fetchResultPresignedUrl(processingDocumentResults),
    { staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000 },
  )

  const presignedUrlsMap = new Map(presignedUrls?.map((presignedUrl) => [presignedUrl.filename, presignedUrl]))

  return { presignedUrlsMap, loadingPresigned }
}
