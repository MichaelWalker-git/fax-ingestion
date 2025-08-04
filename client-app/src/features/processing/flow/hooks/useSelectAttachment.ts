import { useCustomNode } from '../context/CustomNodeContext.tsx'
import { useProcessingFlow } from '../context/ProcessingFlowContext.tsx'
import { GmailAttachmentFile } from '../../../../types/Gmail.ts'
import { UploadedFile } from '../../../../types/File.ts'

export function useSelectAttachment({ attachments }: { attachments?: GmailAttachmentFile[] }): {
  selectedAll: boolean
  handleSelectAll: VoidFunction
  handleSelect: (fileId: string) => void
  isSelected: (fileId: string) => boolean
} {
  const { nodeId } = useCustomNode()

  const { putCustomNode, getCustomNode } = useProcessingFlow()

  const isSelectedAll = () => {
    const customNode = getCustomNode(nodeId)
    return customNode?.processingFiles?.length === attachments?.length
  }

  const handleSelectAll = () => {
    const customNode = getCustomNode(nodeId)
    const selectedAttachments = isSelectedAll() ? [] : attachments
    if (customNode) {
      putCustomNode({
        ...customNode,
        processingFiles: transformAttachmentsToFiles(selectedAttachments || []),
      })
    }
  }

  const handleSelect = (fileId: string) => {
    const customNode = getCustomNode(nodeId)
    if (!customNode) {
      return
    }

    const selectedAttachment = attachments!.find((attachment) => attachment.fileId === fileId)!

    const selectedAttachments = isSelected(fileId)
      ? customNode.processingFiles?.filter((attachment) => attachment.fileId !== fileId)
      : [...(customNode.processingFiles || []), transformAttachmentToFile(selectedAttachment)]

    putCustomNode({
      ...customNode,
      processingFiles: selectedAttachments || [],
    })
  }

  const isSelected = (fileId: string) => {
    const customNode = getCustomNode(nodeId)
    return customNode?.processingFiles?.some((attachment) => attachment.fileId === fileId) ?? false
  }

  return {
    selectedAll: isSelectedAll(),
    handleSelectAll,
    handleSelect,
    isSelected,
  }
}

const transformAttachmentsToFiles = (attachments: GmailAttachmentFile[]): UploadedFile[] => {
  return attachments.map((attachment) => {
    return transformAttachmentToFile(attachment)
  })
}

const transformAttachmentToFile = (attachment: GmailAttachmentFile): UploadedFile => {
  return {
    fileId: attachment.fileId,
    name: attachment.filename,
  }
}
