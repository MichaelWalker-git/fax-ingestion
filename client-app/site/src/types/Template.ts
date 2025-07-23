import { EmailTrigger } from './EmailTrigger.ts'

export interface Template {
  template: any
  triggerOnOption?: EmailTrigger
  templateReactFlow?: string
  name: string
  updatedAt: string
}
