import isEqual from 'lodash.isequal'
import { useCallback, useMemo, useState } from 'react'

import { useLocalStorage } from '../../shared/hooks/useLocalStorage.ts'
import { SettingsValueProps } from '../../types/ViewSettingsContext.ts'
import { ViewSettingsContext } from './view-settings-context.tsx'

// ----------------------------------------------------------------------

type SettingsProviderProps = {
  children: React.ReactNode
  defaultSettings: SettingsValueProps
}

export function ViewSettingsProvider({ children, defaultSettings }: SettingsProviderProps) {
  const [openDrawer, setOpenDrawer] = useState(false)

  const [settings, setSettings] = useLocalStorage('settings', defaultSettings)

  const onUpdate = useCallback(
    (name: string, value: string | boolean) => {
      setSettings((prevState: SettingsValueProps) => ({
        ...prevState,
        [name]: value,
      }))
    },
    [setSettings],
  )

  // Reset
  const onReset = useCallback(() => {
    setSettings(defaultSettings)
  }, [defaultSettings, setSettings])

  // Drawer
  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev)
  }, [])

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false)
  }, [])

  const canReset = !isEqual(settings, defaultSettings)

  const memoizedValue = useMemo(
    () => ({
      ...settings,
      onUpdate,
      // Reset
      canReset,
      onReset,
      // Drawer
      openDrawer,
      onToggleDrawer,
      onCloseDrawer,
    }),
    [onReset, onUpdate, settings, canReset, openDrawer, onCloseDrawer, onToggleDrawer],
  )

  return <ViewSettingsContext.Provider value={memoizedValue}>{children}</ViewSettingsContext.Provider>
}
