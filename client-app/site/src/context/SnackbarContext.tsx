import { ReactNode, createContext, useContext, useState } from 'react'
import SnackbarAlert from '../shared/components/snackbar/SnackbarAlert.tsx'
import { Box } from '@mui/material'

type SnackbarMessage = {
  id: string
  text: string
  severity: 'success' | 'error'
  variant?: 'filled' | 'standard' | 'outlined'
}

export const SnackbarContext = createContext<{
  snackbars: SnackbarMessage[]
  setSnackbar: (snackbar: Omit<SnackbarMessage, 'id'>) => void
  removeSnackbar: (id: string) => void
}>({
  snackbars: [],
  setSnackbar: () => {},
  removeSnackbar: () => {},
})

export default function SnackbarContextProvider({ children }: { children: ReactNode }) {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([])

  const setSnackbar = (snackbar: Omit<SnackbarMessage, 'id'>) => {
    const id = crypto.randomUUID()
    setSnackbars((prev) => [...prev, { ...snackbar, id }])
  }

  const removeSnackbar = (id: string) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <SnackbarContext.Provider value={{ snackbars, setSnackbar, removeSnackbar }}>
      <>
        {children}
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            zIndex: 1400,
          }}
        >
          {snackbars.map(({ id, text, severity, variant }) => (
            <SnackbarAlert
              key={id}
              open
              text={text}
              severity={severity}
              variant={variant}
              handleClose={() => removeSnackbar(id)}
            />
          ))}
        </Box>
      </>
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = () => {
  return useContext(SnackbarContext)
}
