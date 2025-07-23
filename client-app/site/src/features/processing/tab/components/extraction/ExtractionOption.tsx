import { Radio, Stack, Typography } from '@mui/material'
import Iconify from '../../../../../shared/components/iconify'

interface ExtractionOptionProps {
  icon: string
  text: string
  value: string
  onSelect?: (value: string) => void
  checked?: boolean
  warning?: string
  radio?: boolean
  showCheckedIcon?: boolean
}

export default function ExtractionOption({
  icon,
  text,
  warning,
  checked,
  value,
  onSelect,
  radio,
  showCheckedIcon,
}: ExtractionOptionProps) {
  return (
    <Stack
      direction="row"
      width="600px"
      sx={{
        border: '1px solid',
        borderColor: checked ? 'primary.main' : 'action.selected',
        borderRadius: '8px',
        justifyContent: 'space-between',
        p: 1,
        cursor: onSelect ? 'pointer' : 'auto',
      }}
      onClick={() => onSelect?.(value)}
    >
      <Stack flex={1}>
        {radio && (
          <Radio
            sx={{ padding: 0, width: '20px' }}
            checked={checked}
            value={value}
            name="radio-buttons"
            inputProps={{ 'aria-label': 'A' }}
          />
        )}
        {showCheckedIcon && <Iconify icon="ic:baseline-check" color="primary.main" />}
      </Stack>
      <Stack flex={1} alignItems="center" gap={0.5}>
        <Iconify icon={icon} color={checked ? 'primary.main' : 'text.secondary'} />
        <Typography variant="caption" color={checked ? 'primary.main' : 'text.secondary'}>
          {text}
        </Typography>
      </Stack>
      <Stack flex={1} alignItems="flex-end">
        {warning && <Iconify icon="solar:danger-bold" color="error.main" />}
      </Stack>
    </Stack>
  )
}
