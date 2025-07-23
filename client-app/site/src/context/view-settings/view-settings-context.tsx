import { createContext, useContext } from 'react'

import { ViewSettingsContextProps } from '../../types/ViewSettingsContext.ts'

export const ViewSettingsContext = createContext({} as ViewSettingsContextProps)

export const useSettingsContext = () => {
  const context = useContext(ViewSettingsContext)

  if (!context) throw new Error('useSettingsContext must be use inside SettingsProvider')

  return context
}
