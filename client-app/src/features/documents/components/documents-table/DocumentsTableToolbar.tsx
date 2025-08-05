import {
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { IDocumentTableFilters, IDocumentTableFilterValue } from '../../../../types/DocumentType.ts'
import Iconify from '../../../../shared/components/iconify/iconify.tsx'
import { Dispatch, useCallback } from 'react'
import { DOCUMENTS_VIEW, DocumentViewType } from '../../utils/utils.tsx'

type DocumentsTableToolbarProps = {
  filters: IDocumentTableFilters
  onFilters: (name: string, value: IDocumentTableFilterValue) => void
  formatOptions: string[]
  onExportCSV: VoidFunction
  onPrint: VoidFunction
  view: string
  onChangeView: Dispatch<DocumentViewType>
}

export default function DocumentsTableToolbar({
  filters,
  onFilters,
  formatOptions,
  onExportCSV,
  onPrint,
  view,
  onChangeView,
}: DocumentsTableToolbarProps) {
  const handleFilterFormat = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters('format', typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value)
    },
    [onFilters],
  )

  const handleFilterUpdatedDate = useCallback(
    (newValue: Date | null) => {
      onFilters('updatedAt', newValue)
    },
    [onFilters],
  )

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          pr: { xs: 2.5, md: 1 },
          fullwidth: { xs: 1, md: 0 },
        }}
        justifyContent="space-between"
      >
        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={2}
          flex={2}
        >
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 180 },
            }}
          >
            <InputLabel>Format</InputLabel>

            <Select
              multiple
              value={filters.format}
              onChange={handleFilterFormat}
              input={<OutlinedInput label="Service" />}
              renderValue={(selected) => selected.map((value) => value).join(', ')}
              sx={{ textTransform: 'capitalize' }}
            >
              {formatOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox disableRipple size="small" checked={filters.format.includes(option)} />
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DatePicker
            label="Modified Date"
            value={filters.updatedAt}
            onChange={handleFilterUpdatedDate}
            slotProps={{ textField: { fullWidth: true } }}
            sx={{
              maxWidth: { md: 180 },
            }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2} flex={0} sx={{ width: 1 }}>
          <Button startIcon={<Iconify icon="ic:baseline-print" />} onClick={onPrint}>
            Print
          </Button>
          <Button startIcon={<Iconify icon="ic:baseline-file-download" />} onClick={onExportCSV}>
            Export
          </Button>
          <ToggleButtonGroup exclusive value={view} size="small" onChange={(_, value) => onChangeView(value)}>
            <ToggleButton value={DOCUMENTS_VIEW.TABLE} aria-label="table">
              <Iconify icon="ic:round-view-list" />
            </ToggleButton>

            <ToggleButton value={DOCUMENTS_VIEW.CARD} aria-label="card">
              <Iconify icon="ic:round-grid-view" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
    </>
  )
}
