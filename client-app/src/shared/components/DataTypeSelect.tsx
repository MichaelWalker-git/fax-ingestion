import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

interface DataTypeSelectProps {
  value?: string
  onChange: (value: string) => void
}

export default function DataTypeSelect({ value = '', onChange }: DataTypeSelectProps) {
  return (
    <FormControl size="small" sx={{ width: '7rem' }}>
      <InputLabel id="select-label">Type</InputLabel>
      <Select
        className="nodrag"
        labelId="select-label"
        id="select"
        value={value}
        label="Type"
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="string">String</MenuItem>
        <MenuItem value="number">Number</MenuItem>
        <MenuItem value="boolean">Boolean</MenuItem>
        <MenuItem value="date">Date</MenuItem>
      </Select>
    </FormControl>
  )
}
