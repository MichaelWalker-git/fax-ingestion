import * as React from 'react'

export interface CustomStep {
  label: string
  subLabel?: string
  content: string | React.ReactNode
}
