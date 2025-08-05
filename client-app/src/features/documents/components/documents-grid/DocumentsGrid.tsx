import { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Box, Button, Typography, CircularProgress } from '@mui/material'
import DocumentsGridItem from './DocumentsGridItem.tsx'
import Iconify from '../../../../shared/components/iconify'
import { IDocumentType } from '../../../../types/DocumentType.ts'
import { TableProps } from '../../../../shared/components/table'

interface DocumentsGridProps {
  documents: IDocumentType[]
  onViewRow: (rowId: string) => void
  onStartProcessing: (rowId: string) => void
  onDeleteRow: (rowId: string) => void
  table: TableProps
  onConfirm: VoidFunction
  deletingRows: string[]
}

const PAGE_SIZE = 10

export default function DocumentsGrid({
  documents,
  onStartProcessing,
  onDeleteRow,
  onViewRow,
  table,
  onConfirm,
  deletingRows,
}: DocumentsGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const fetchMoreData = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + PAGE_SIZE, documents.length))
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <InfiniteScroll
        dataLength={visibleCount}
        next={fetchMoreData}
        hasMore={visibleCount < documents.length}
        loader={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress />
          </Box>
        }
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 24,
          overflow: 'visible',
        }}
      >
        {documents.slice(0, visibleCount).map((document) => (
          <DocumentsGridItem
            key={document.sortKey}
            document={document}
            onDeleteRow={onDeleteRow}
            onSelectRow={() => table.onSelectRow(document.sortKey)}
            onViewRow={onViewRow}
            onStartProcessing={onStartProcessing}
            isSelected={table.selected.includes(document.sortKey)}
            isDeleting={deletingRows.includes(document.sortKey)}
          />
        ))}
      </InfiniteScroll>

      {table.selected && table.selected.length > 0 && (
        <Box
          sx={{
            backgroundColor: 'text.primary',
            position: 'fixed',
            bottom: 24,
            right: 24,
            p: 2,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Iconify icon="eva:checkmark-circle-2-fill" color="primary.main" />
          <Typography variant="body2" color="common.white">
            {table.selected.length} items selected
          </Typography>
          <Button variant="contained" color="error" size="small" onClick={onConfirm}>
            Delete
          </Button>
        </Box>
      )}
    </Box>
  )
}
