import { Divider, Stack, Typography } from '@mui/material'
import DocumentSchemaForm from '../../../common/components/schema/DocumentSchemaForm.tsx'
import { ProcessingContext } from '../../context/ProcessingContext.tsx'
import { use } from 'react'
import { IField } from '../../../../../types/Scema.ts'

export default function FormExtraction() {
  const { formSchema, setFormSchema } = use(ProcessingContext)

  const handleFieldChange = (fields: IField[]) => {
    setFormSchema({ fields })
  }

  return (
    <Stack gap={3}>
      <Typography variant="caption">
        Identify and extract structured fields (e.g., names, dates, addresses) for organized data processing.
      </Typography>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <Stack gap={1}>
        <Typography variant="subtitle2">Configure fields</Typography>
        <Typography variant="caption" color="textDisabled">
          To improve extraction accuracy, specify the data type and its order number from the file. Save or apply
          templates to reuse predefined settings across multiple documents.
        </Typography>
      </Stack>
      <Stack>
        <DocumentSchemaForm fields={formSchema?.fields || []} setFields={handleFieldChange} />
      </Stack>
    </Stack>
  )
}
