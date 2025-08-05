import { Box, Button, Chip, Stack, StackProps } from '@mui/material'
import { IDocumentTableFilters, IDocumentTableFilterValue } from '../../../../types/DocumentType.ts'
import FiltersResultBlock from './FiltersResultBlock.tsx'
import Iconify from '../../../../shared/components/iconify'
import { fDate } from '../../../../utils/date.ts'

type DocumentsTableFiltersResultProps = StackProps & {
  filters: IDocumentTableFilters
  onFilters: (name: string, value: IDocumentTableFilterValue) => void
  onResetFilters: VoidFunction
  results: number
}

export default function DocumentsTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}: DocumentsTableFiltersResultProps) {
  const handleRemoveFormat = (inputValue: string) => {
    const newValue = filters.format.filter((item) => item !== inputValue)
    onFilters('format', newValue)
  }

  const handleRemoveStatus = () => {
    onFilters('status', 'all')
  }

  const handleRemoveDate = () => {
    onFilters('updatedAt', null)
  }

  return (
    <Stack spacing={1.5} p={0} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {!!filters.format.length && (
          <FiltersResultBlock label="Format:">
            {filters.format.map((item) => (
              <Chip variant="soft" key={item} label={item} size="small" onDelete={() => handleRemoveFormat(item)} />
            ))}
          </FiltersResultBlock>
        )}

        {filters.status !== 'all' && (
          <FiltersResultBlock label="Status:">
            <Chip variant="soft" size="small" label={filters.status} onDelete={handleRemoveStatus} />
          </FiltersResultBlock>
        )}

        {!!filters.updatedAt && (
          <FiltersResultBlock label="Date:">
            <Chip size="small" label={fDate(filters.updatedAt, 'dd MMM yy')} onDelete={handleRemoveDate} />
          </FiltersResultBlock>
        )}

        <Button color="error" onClick={onResetFilters} startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}>
          Clear
        </Button>
      </Stack>
    </Stack>
  )
}
