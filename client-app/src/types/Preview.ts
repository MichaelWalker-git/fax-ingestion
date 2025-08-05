export interface PreviewUrl {
  url?: string
  loading: boolean
  error?: boolean
}

export interface ChildDocumentsPreviewUrls {
  [key: string]: PreviewUrl
}
