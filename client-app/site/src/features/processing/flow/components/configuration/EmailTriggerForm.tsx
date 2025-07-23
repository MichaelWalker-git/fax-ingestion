import { Stack, Typography } from '@mui/material'
import { Controller, UseFormReturn } from 'react-hook-form'
import MultiSelectWithChips from '../../../../../shared/components/custom-select/MultiSelectWithChips.tsx'
import { SUPPORTED_CONTENT_TYPES } from '../../../../../shared/constants/gmail.ts'
import LabeledTextField from '../../../../../shared/components/custom-labeled-text-field/LabeledTextField.tsx'
import { EmailTriggerFormValues } from '../../../../../types/EmailTrigger.ts'

interface GmailReaderFormProps {
  form: UseFormReturn<EmailTriggerFormValues>
}

export default function EmailTriggerForm({ form }: GmailReaderFormProps) {
  const { control } = form

  return (
    <Stack gap={2} pb={4}>
      <Stack gap={1}>
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
        <Typography variant="caption" color="text.secondary">
          Email addresses scheduled for processing
        </Typography>
      </Stack>
      <Controller
        name="attachmentFormats"
        control={control}
        render={({ field }) => (
          <MultiSelectWithChips
            items={field.value}
            onChange={field.onChange}
            onDelete={(value) => field.onChange(field.value.filter((label: string) => label !== value))}
            options={[
              {
                value: SUPPORTED_CONTENT_TYPES.PDF,
                label: 'PDF',
              },
              {
                value: SUPPORTED_CONTENT_TYPES.PNG,
                label: 'PNG',
              },
              {
                value: SUPPORTED_CONTENT_TYPES.JPEG,
                label: 'JPEG',
              },
            ]}
            label="Attachment Format "
          />
        )}
      />
    </Stack>
  )
}
