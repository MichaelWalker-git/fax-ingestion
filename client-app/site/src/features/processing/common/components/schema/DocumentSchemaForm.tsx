import { Box, Button, Stack, TextField } from '@mui/material'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { IField } from '../../../../../types/Scema.ts'
import DataTypeSelect from '../../../../../shared/components/DataTypeSelect.tsx'
import Iconify from '../../../../../shared/components/iconify'

interface DocumentSchemaFormProps {
  fields: IField[]
  setFields: (fields: IField[]) => void
  setIsValid?: Dispatch<SetStateAction<boolean>>
}

const formSchema = z.object({
  fieldName: z.string().max(100, 'Field name is too long.'),
  fieldNumber: z.string().max(10, 'Too long'),
})

export default function DocumentSchemaForm({ fields = [], setFields, setIsValid }: DocumentSchemaFormProps) {
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: { [key: string]: string[] } }>({})

  useEffect(() => {
    const hasErrors = Object.values(validationErrors).some((errors) => errors)
    setIsValid?.(!hasErrors)
  }, [validationErrors, setIsValid])

  const handleFieldChange = useCallback(
    (index: number, key: keyof IField, value: string) => {
      const updatedFields = fields.map((field, idx) => (idx === index ? { ...field, [key]: value } : field))
      setFields(updatedFields)
      const validation = formSchema.safeParse(updatedFields[index])
      if (!validation.success) {
        setValidationErrors((prevState) => ({ ...prevState, [index]: validation.error.flatten().fieldErrors }))
      } else {
        setValidationErrors((prevState) => ({ ...prevState, [index]: undefined }))
      }
    },
    [fields, setFields],
  )

  return (
    <Box display="flex" gap={2} flexDirection="column" overflow="auto" pt={2} pr={1} maxHeight="540px">
      {fields?.map((field: IField, index: number) => (
        <Box key={index} display="flex" gap={2} alignItems="center">
          <TextField
            autoFocus
            value={field.fieldName}
            onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
            sx={{ flex: 4 }}
            label="Field Name"
            size="small"
            error={validationErrors[index]?.fieldName?.length > 0}
            helperText={validationErrors[index]?.fieldName?.[0]}
          />
          <DataTypeSelect value={field.fieldType} onChange={(value) => handleFieldChange(index, 'fieldType', value)} />
          <TextField
            value={field.fieldNumber}
            onChange={(e) => handleFieldChange(index, 'fieldNumber', e.target.value)}
            sx={{
              flex: 1,
              'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': { display: 'none' },
            }}
            label="Number"
            type="number"
            size="small"
            error={validationErrors[index]?.fieldNumber?.length > 0}
            helperText={validationErrors[index]?.fieldNumber?.[0]}
          />
          <Iconify
            icon="ic:baseline-delete"
            onClick={() => setFields([...fields.slice(0, index), ...fields.slice(index + 1)])}
            sx={{ cursor: 'pointer', color: 'text.secondary' }}
          />
        </Box>
      ))}
      <Stack alignItems="flex-start">
        <Button
          startIcon={<Iconify icon="ic:baseline-add" />}
          onClick={() => setFields([...fields, { fieldName: '', fieldNumber: '', fieldValue: '' }])}
        >
          Add Selection
        </Button>
      </Stack>
    </Box>
  )
}
