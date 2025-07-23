export interface Table {
  tableName: string
  rows: string[]
  columns: Column[]
  columnGroups: { groupId: string; headerName: string; children: Column[] }[]
}

export interface Column {
  field: string
  headerName: string
  type?: string
  flex?: number
}
