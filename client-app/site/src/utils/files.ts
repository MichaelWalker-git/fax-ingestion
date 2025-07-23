import { IDocumentType } from '../types/DocumentType.ts'
import { fetchResultPresignedUrl } from '../shared/api/actions/presign.ts'
import { ProcessingResult } from '../types/ProcessingResults.ts'

export function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const getFileFormat = (filename: string) => {
  if (!filename) {
    return
  }
  const parts = filename.split('.')
  return parts.length > 1 ? parts?.pop()?.toLowerCase() : null
}

export const decodeBase64 = (base64String: string) => {
  try {
    const sanitizedBase64 = base64String.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '')

    const paddedBase64 = sanitizedBase64.padEnd(sanitizedBase64.length + ((4 - (sanitizedBase64.length % 4)) % 4), '=')

    const binaryString = atob(paddedBase64)

    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return new TextDecoder('utf-8').decode(bytes)
  } catch (error) {
    console.error('Error decoding base64:', error)
  }
}

export async function downloadAllFiles(documents: ProcessingResult[], filenames?: { [key: string]: string }) {
  const fetchPresignedUrlFunc = fetchResultPresignedUrl(documents)
  const presignedUrls = await fetchPresignedUrlFunc()

  const presignedUrlsMap = new Map(presignedUrls.map((presignedUrl) => [presignedUrl.filename, presignedUrl]))

  for (const document of documents) {
    const presignedUrl = presignedUrlsMap.get(document.filename)?.getUrl
    if (!presignedUrl) {
      continue
    }
    const response = await fetch(presignedUrl)
    const blob = await response.blob()
    download(blob, !filenames ? document.filename : filenames[document.filename])
  }
}

export async function downloadAllFilesAsCsv(documents: IDocumentType[], filenames?: { [key: string]: string }) {
  const fetchPresignedUrlFunc = fetchResultPresignedUrl(documents)
  const presignedUrls = await fetchPresignedUrlFunc()

  const presignedUrlsMap = new Map(presignedUrls.map((presignedUrl) => [presignedUrl.filename, presignedUrl]))

  for (const document of documents) {
    const presignedUrl = presignedUrlsMap.get(document.filename)?.getUrl
    if (!presignedUrl) {
      continue
    }
    const response = await fetch(presignedUrl)
    const json = await response.json()
    json.result.forEach((table: { columns: Column[]; rows: Row[] }) => {
      const csv = convertToCsv(table.columns, table.rows)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      download(blob, !filenames ? document.filename : filenames[document.filename])
    })
  }
}

type Column = { field: string; headerName?: string }
type Row = { [key: string]: any }

export function convertToCsv(columns: Column[], rows: Row[]): string {
  const headers = columns.map((col) => col.headerName ?? col.field)

  const csvRows = rows.map((row) => {
    return columns
      .map((col) => {
        let value = row[col.field]

        if (value == null) value = ''
        else if (typeof value === 'string') {
          value = `"${value.replace(/"/g, '""')}"`
        } else {
          value = `"${value}"`
        }

        return value
      })
      .join(',')
  })

  return [headers.join(','), ...csvRows].join('\n')
}
