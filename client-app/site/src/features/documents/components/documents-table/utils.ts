import { IDocumentTableFilters, IDocumentType } from '../../../../types/DocumentType.ts'
import { fileFormat } from '../../../../shared/components/file-thumbnail'
import { isRecent, isSameDay } from '../../../../utils/date.ts'
import { TABS_VALUES } from '../../utils/utils.tsx'

export function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData?: IDocumentType[]
  comparator: (a: any, b: any) => number
  filters: IDocumentTableFilters
}) {
  if (!inputData) {
    return
  }

  const { status, format, updatedAt } = filters

  const stabilizedThis = inputData.map((el, index) => [el, index] as const)

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })

  inputData = stabilizedThis.map((el) => el[0])

  if (status !== TABS_VALUES.ALL) {
    if (status === TABS_VALUES.RECENT) {
      inputData = inputData.filter((document) => isRecent(document.updatedAt!))
    } else {
      inputData = inputData.filter((document) => document.status?.toLowerCase() === status?.toLowerCase())
    }
  }

  if (format.length) {
    inputData = inputData.filter((document) => {
      const documentFormat = fileFormat(document.filename)
      return documentFormat
        ? format.includes(documentFormat.toLowerCase()) || format.includes(documentFormat.toUpperCase())
        : false
    })
  }

  if (updatedAt) {
    inputData = inputData.filter((document) => isSameDay(document.updatedAt!, updatedAt))
  }

  return inputData
}

export const FORMAT_OPTIONS = ['PDF', 'Image']
