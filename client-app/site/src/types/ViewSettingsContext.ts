export type SettingsValueProps = {
  themeMode: 'light' | 'dark'
  themeLayout: 'vertical' | 'horizontal' | 'mini'
}

export type ViewSettingsContextProps = SettingsValueProps & {
  openDrawer: boolean
  onToggleDrawer: VoidFunction
  onCloseDrawer: VoidFunction
  onUpdate: (name: string, value: string | boolean) => void
}
