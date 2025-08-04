import { Button, Card, CircularProgress, IconButton, Stack, Typography } from '@mui/material'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import FileThumbnail from '../../../../shared/components/file-thumbnail'
import { getFileFormat } from '../../../../utils/files.ts'
import Iconify from '../../../../shared/components/iconify'
import { usePopover } from '../../../../shared/components/custom-popover'
import DocumentsPopover from '../DocumentsPopover.tsx'
import { ConfirmDialog } from '../../../../shared/components/custom-dialog'
import { useBoolean } from '../../../../shared/hooks/useBoolean.ts'
import { formatDate } from '../../../../utils/date.ts'

interface DocumentsGridItemProps {
  document: IDocumentType
  onSelectRow: VoidFunction
  onViewRow: (rowId: string) => void
  onStartProcessing: (rowId: string) => void
  onDeleteRow: (rowId: string) => void
  isSelected?: boolean
  isDeleting?: boolean
}

export default function DocumentsGridItem({
  document,
  onDeleteRow,
  onViewRow,
  onStartProcessing,
  onSelectRow,
  isSelected,
  isDeleting,
}: DocumentsGridItemProps) {
  const fileFormat = getFileFormat(document.filename)
  const popover = usePopover()
  const confirm = useBoolean()

  return (
    <>
      <Card
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&:hover': { backgroundColor: 'background.neutral' },
        }}
        onClick={onSelectRow}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {isDeleting ? (
            <CircularProgress sx={{ width: '22px !important', height: '22px !important' }} />
          ) : isSelected ? (
            <Iconify icon="eva:checkmark-circle-2-fill" color="primary.main" />
          ) : (
            <FileThumbnail file={fileFormat || ''} sx={{ width: 36, height: 36, mr: 1 }} />
          )}

          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={(event) => {
              popover.onOpen(event)
              event.stopPropagation()
            }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
        <img src="/assets/images/file-preview.jpeg" alt="document preview" />
        <Stack>
          <Typography variant="subtitle1">{document.filename}</Typography>
          <Typography variant="caption" color="textDisabled">
            {document.updatedAt && formatDate(document.updatedAt)}
          </Typography>
        </Stack>
      </Card>
      <DocumentsPopover
        open={popover.open}
        onClose={popover.onClose}
        onDeleteRow={() => onDeleteRow(document.sortKey)}
        onViewRow={() => onViewRow(document.sortKey)}
        onStartProcessing={() => onStartProcessing(document.sortKey)}
        onConfirm={confirm.onTrue}
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow(document.sortKey)
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
