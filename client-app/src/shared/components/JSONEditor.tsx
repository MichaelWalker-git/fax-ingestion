import { Box, Button, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import JSONPretty from 'react-json-pretty'
import 'react-json-pretty/themes/acai.css'

interface JSONEditorProps {
  schema?: string
  setSchema: React.Dispatch<React.SetStateAction<string | undefined>>
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>
}

const JSONEditor: React.FC<JSONEditorProps> = ({ schema = '', setSchema, setIsValid }) => {
  const [jsonInputState, setJsonInputState] = useState(schema)
  const [error, setError] = useState<string | null>(null)
  const [formattedJsonViewMode, setFormattedJsonViewMode] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInputState(e.target.value)
    try {
      setSchema(JSON.parse(e.target.value))
      setError(null)
      setIsValid(true)
    } catch {
      setError('Invalid JSON syntax.')
      setIsValid(false)
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap={2} maxWidth="600px" maxHeight="900px">
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h5">Type schema in JSON format</Typography>
        <Button onClick={() => setFormattedJsonViewMode(!formattedJsonViewMode)}>
          {formattedJsonViewMode ? 'Text View Mode' : 'Json View Mode'}
        </Button>
      </Box>
      {!formattedJsonViewMode && (
        <TextField
          multiline
          rows={14}
          fullWidth
          value={jsonInputState}
          onChange={handleInputChange}
          error={!!error}
          helperText={error || 'Valid JSON'}
          placeholder={'{"key": "value"}'}
        />
      )}
      {formattedJsonViewMode && (
        <Box bgcolor="#f9f9f9" border="1px solid #ccc" borderRadius="4px">
          <JSONPretty
            id="json-pretty"
            data={jsonInputState}
            mainStyle="padding:1em;min-height:262px;margin:0;max-height:400px"
          />
        </Box>
      )}
    </Box>
  )
}

export default JSONEditor
