import { MapTableProcessingResult } from '../../../../../types/ProcessingResults.ts'
import { Table } from '../../../../../types/Table.ts'

export function isMapProcessingResultArray(result: any) {
  return Array.isArray(result) && result.length > 0 && 'result' in result[0]
}

export const handleColumns = (columns: { field: string; headerName: string }[]) => {
  return columns.map((column) => ({
    ...column,
    renderCell: (params: { value?: string; row: { depth?: number } }) => {
      const depth = params.row.depth ?? 0
      return <div style={{ marginLeft: depth * 20 }}>{params.value}</div>
    },
  }))
}

export function mergeTableResults(data: MapTableProcessingResult[]): Table[] {
  const allTables: Table[] = []

  for (const entry of data) {
    try {
      allTables.push(...entry.result)
    } catch (err) {
      console.error(`Failed to parse result on page ${entry.page}`, err)
    }
  }

  return allTables
}
