import { Checkbox, Chip, MenuItem, OutlinedInput, Select, Stack, Typography } from '@mui/material'
import Iconify from '../iconify'

interface MultiSelectWithChipsProps {
  items: string[]
  onChange: (value: string[]) => void
  onDelete: (value: string) => void
  options: {
    value: string
    label: string
  }[]
  label?: string
}

export default function MultiSelectWithChips({ items, onChange, onDelete, options, label }: MultiSelectWithChipsProps) {
  return (
    <Stack gap={1}>
      {label && <Typography variant="subtitle2">{label}</Typography>}
      <Select
        label={null}
        size="small"
        className="nodrag"
        multiple
        value={items}
        onChange={(event) => {
          onChange(event.target.value as string[])
        }}
        input={<OutlinedInput label="" />}
        renderValue={(selected) => (
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {selected.map((value) => (
              <Chip
                variant="soft"
                // @ts-ignore
                color="inherit"
                key={value}
                label={options.find((opt) => opt.value === value)?.label}
                size="small"
                onDelete={() => {
                  onDelete(value)
                }}
                onClick={(event: { stopPropagation: () => void }) => {
                  event.stopPropagation()
                }}
                onMouseDown={(event: { stopPropagation: () => void; preventDefault: () => void }) => {
                  event.stopPropagation()
                  event.preventDefault()
                }}
                deleteIcon={
                  <Iconify
                    icon="solar:close-circle-bold"
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                  />
                }
              />
            ))}
          </Stack>
        )}
        sx={{ textTransform: 'capitalize', maxWidth: 500 }}
      >
        {options.map(({ value, label }) => (
          <MenuItem key={value} value={value}>
            <Checkbox disableRipple size="small" checked={items.includes(value)} />
            {label}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  )
}
