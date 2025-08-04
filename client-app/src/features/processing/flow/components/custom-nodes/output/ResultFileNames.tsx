import { Stack, TextField, Typography } from '@mui/material'

interface ResultFileNamesProps {
  fileNames: string[]
  outputFileNames: { [key: string]: string }
  setOutputFileNames: (newFileNames: { [key: string]: string }) => void
}

export default function ResultFileNames({ fileNames, outputFileNames, setOutputFileNames }: ResultFileNamesProps) {
  return (
    <>
      {fileNames.map((filename) => (
        <Stack key={filename} flexDirection="row" alignItems="center" gap={1}>
          <TextField
            size="small"
            label="File name"
            value={outputFileNames[filename]}
            onChange={(event) => setOutputFileNames({ ...outputFileNames, [filename]: event.target.value })}
          />
          <Typography variant="body2" color="text.secondary">
            .json
          </Typography>
        </Stack>
      ))}
    </>
  )
}
