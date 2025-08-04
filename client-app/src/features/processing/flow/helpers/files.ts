import { CustomNode } from '../../../../types/ProcessingFlow.ts'

export function normalizeFiles(files: { name: string }[]) {
  return files.reduce(
    (acc, item) => {
      acc[item.name] = item.name?.replace(/\.[^/.]+$/, '')
      return acc
    },
    {} as { [key: string]: string },
  )
}

export function getProcessingFilesFromNode(node?: CustomNode | null) {
  if (!node) {
    return []
  }

  const processingFiles = node?.processingFiles

  const pagesItems = node?.childrenPages?.length
    ? node?.childrenPages.map((document) => ({
        fileId: document.sortKey,
        parentFileId: document.mainFileId,
      }))
    : []

  let processingFilesItems = processingFiles?.map(({ fileId }) => ({ fileId, parentFileId: fileId })) || []

  if (pagesItems?.length > 0 && processingFilesItems?.length > 0) {
    processingFilesItems = processingFilesItems.filter(
      ({ fileId }) => !pagesItems.some((page) => page.parentFileId === fileId),
    )
  }

  return [...processingFilesItems, ...pagesItems]
}
