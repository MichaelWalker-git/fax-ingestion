export const TRIGGERS_TABLE_HEAD = [
  { id: 'name', label: 'Name', width: 140 },
  { id: 'from', label: 'From', width: 130 },
  { id: 'updatedAt', label: 'Last Activity', width: 120 },
  { id: 'status', label: 'Status', width: 60 },
  { id: '', width: 88 },
]

export const PROCESSING_TABLE_TABS = [
  { value: 'triggers', label: 'Triggers', icon: 'trigger' },
  { value: 'flows', label: 'Flows (COMING SOON)', icon: 'flow' },
] as const
