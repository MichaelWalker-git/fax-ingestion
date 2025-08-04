import { Box, TextField } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'

interface DocumentPromptProps {
  prompt?: string
  setPrompt?: (prompt: string) => void
  setIsValidationError?: (isValidationError: boolean) => void
  rows?: number
  error?: string
}

export default function DocumentPrompt({
  prompt,
  setPrompt,
  setIsValidationError,
  rows = 6,
  error,
}: DocumentPromptProps) {
  const [validationError, setValidationError] = useState<string>()

  const validate = useCallback(
    (value: string) => {
      if (value?.length > 3000) {
        setValidationError('Prompt is too long')
      } else if (validationError) {
        setValidationError(undefined)
      }
    },
    [validationError],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt?.(e.target.value)
    validate(e.target.value)
  }

  useEffect(() => {
    if (prompt) {
      validate(prompt)
    }
  }, [prompt, validate])

  useEffect(() => {
    setIsValidationError?.(!!validationError)
  }, [validationError, setIsValidationError])

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        multiline
        rows={rows}
        fullWidth
        value={prompt}
        onChange={handleInputChange}
        placeholder={'Type your question'}
        error={!!validationError || !!error}
        helperText={validationError || error}
        className="nodrag"
      />
    </Box>
  )
}
