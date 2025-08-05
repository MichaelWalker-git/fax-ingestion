import { PROCESSING_MODES, PROCESSING_MODES_TYPE } from '../../../../../shared/constants/processing-constants.ts'
import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material'
import { IDocumentType } from '../../../../../types/DocumentType.ts'
import Iconify from '../../../../../shared/components/iconify'
import { FILE_STATUSES } from '../../../../../shared/constants/file-constants.ts'
import { useState } from 'react'
import DownloadButton from '../../../common/components/buttons/DownloadButton.tsx'

interface ResultItemProps {
  processingMode: PROCESSING_MODES_TYPE
  processingResults: IDocumentType[]
}

export default function ResultItem({ processingMode, processingResults }: ResultItemProps) {
  const [collapsed, setCollapsed] = useState(true)

  if (!processingMode) {
    return null
  }

  const loading = processingResults.some(
    (result) => result.status === FILE_STATUSES.IN_PROGRESS || result.status === FILE_STATUSES.PARTIALLY_PROCESSED,
  )

  const isAllProcessed = processingResults.every((result) => result.status === FILE_STATUSES.PROCESSED)

  const icon = ICONS_MAP[processingMode]

  return (
    <Stack
      sx={{
        p: 2,
        gap: 1,
        border: '1px solid',
        borderColor: 'action.selected',
        borderRadius: 1,
        width: '100%',
        bgcolor: isAllProcessed ? 'primaryTransparent' : undefined,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" sx={{ gap: 1 }}>
          {icon.isCustom ? (
            <Box component="img" src={icon.name} alt="gmail" sx={{ width: 22, height: 22 }} />
          ) : (
            <Iconify icon={icon.name} />
          )}
          <Typography variant="subtitle2">{TEXT_MAP[processingMode]}</Typography>
        </Stack>
        <Stack>
          {loading ? (
            <CircularProgress color="inherit" sx={{ width: '20px !important', height: '20px !important' }} />
          ) : (
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <Iconify icon="eva:arrow-ios-downward-fill" width={24} />
            </IconButton>
          )}
        </Stack>
      </Stack>
      {!collapsed && (
        <Stack gap={1}>
          {processingResults.map((result) => (
            <Stack key={result.sortKey} direction="row" justifyContent="space-between" alignItems="center">
              <Typography>{result.filename}</Typography>{' '}
              <Stack direction="row" alignItems="center">
                {result.status === FILE_STATUSES.PROCESSED && (
                  <Iconify icon="ic:baseline-check" sx={{ width: 20, height: 20 }} color="primary.main" />
                )}
                <DownloadButton processingDocument={result} />
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

const ICONS_MAP = {
  [PROCESSING_MODES.TEXT]: {
    name: 'ic:baseline-notes',
  },
  [PROCESSING_MODES.FORM]: {
    name: 'ic:baseline-view-agenda',
  },
  [PROCESSING_MODES.TABLE]: {
    name: 'ic:baseline-calendar-view-month',
  },
  [PROCESSING_MODES.QA]: {
    name: 'ic:baseline-question-answer',
  },
  [PROCESSING_MODES.MEDICARE]: {
    name: '/assets/icons/processing-flow/identity.svg',
    isCustom: true,
  },
}

const TEXT_MAP = {
  [PROCESSING_MODES.TEXT]: 'Text',
  [PROCESSING_MODES.FORM]: 'Form',
  [PROCESSING_MODES.TABLE]: 'Table',
  [PROCESSING_MODES.QA]: 'Question',
  [PROCESSING_MODES.MEDICARE]: 'Identity Validation',
  [PROCESSING_MODES.RENTAL_APP]: 'Identity Validation',
}
