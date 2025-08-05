import { FormControlLabel, Stack } from '@mui/material'
import { Controller, UseFormReturn } from 'react-hook-form'
import MultiSelectWithChips from '../../../../../shared/components/custom-select/MultiSelectWithChips.tsx'
import { GAMAL_LABEL_SELECT_OPTIONS, GMAIL_SUPPORTED_CONTENT_TYPES_OPTIONS } from '../../../../../shared/constants/gmail.ts'
import { GmailFiltersFormValues } from '../../../../../types/Gmail.ts'
import Switch from '@mui/material/Switch'
import LabeledTextField from '../../../../../shared/components/custom-labeled-text-field/LabeledTextField.tsx'

interface GmailReaderFormProps {
  form: UseFormReturn<GmailFiltersFormValues>
}

export default function EmailReaderForm({ form }: GmailReaderFormProps) {
  const { control } = form

  return (
    <Stack gap={2}>
      <Controller
        name="labels"
        control={control}
        render={({ field }) => (
          <MultiSelectWithChips
            items={field.value}
            onChange={field.onChange}
            onDelete={(value) => field.onChange(field.value.filter((label: string) => label !== value))}
            options={GAMAL_LABEL_SELECT_OPTIONS}
            label="Labels"
          />
        )}
      />

      <Controller
        name="from"
        control={control}
        render={({ field, fieldState }) => (
          <LabeledTextField
            label="From"
            value={field.value}
            onChange={field.onChange}
            placeholder="Email"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            onBlur={field.onBlur}
          />
        )}
        rules={{
          validate: (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email format',
        }}
      />

      <Controller
        name="attachmentFormats"
        control={control}
        render={({ field }) => (
          <MultiSelectWithChips
            items={field.value}
            onChange={field.onChange}
            onDelete={(value) => field.onChange(field.value.filter((label: string) => label !== value))}
            options={GMAIL_SUPPORTED_CONTENT_TYPES_OPTIONS}
            label="Attachment Format "
          />
        )}
      />

      <Controller
        name="includeSpam"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Include spam emails"
            slotProps={{ typography: { variant: 'body2' } }}
          />
        )}
      />

      <Controller
        name="numberToRead"
        control={control}
        rules={{
          max: {
            value: 20,
            message: 'Must be 20 or less',
          },
        }}
        render={({ field, fieldState }) => (
          <LabeledTextField
            label="Number of Emails to Read"
            value={field.value}
            onChange={field.onChange}
            type="number"
            name={field.name}
            onBlur={field.onBlur}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </Stack>
  )
}
