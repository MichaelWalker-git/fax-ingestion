import { useQuery } from 'react-query'
import { IDocumentType } from '../../types/DocumentType.ts'
import { fetchChildDocuments } from '../api/actions/document.ts'

export default function useChildDocuments(parentDocument?: IDocumentType) {
  const { data: childDocuments, isLoading: loading } = useQuery(
    ['child-documents', parentDocument?.sortKey],
    fetchChildDocuments(parentDocument?.sortKey!),
    {
      enabled: !!parentDocument && !!parentDocument?.isHasChildren,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  )

  if (!parentDocument) {
    return { childDocuments: [], loading: false }
  }

  if (!parentDocument?.isHasChildren) {
    return { childDocuments: [parentDocument], loading: false }
  }

  return { childDocuments: childDocuments ?? [], loading }
}
