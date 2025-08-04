import CssBaseline from '@mui/material/CssBaseline'
import { QueryClient, QueryClientProvider } from 'react-query'
import { HashRouter as Router } from 'react-router-dom'
import AuthenticatorWrapper from './shared/components/AuthenticatorWrapper.tsx'
import { Layout } from './shared/components/Layout/Layout.tsx'
import SnackbarContextProvider from './context/SnackbarContext.tsx'
import { ViewSettingsProvider } from './context/view-settings'
import ThemeProvider from './theme/Index.tsx'
import { configureAmplify } from './utils/amplify-utils.ts'
import { initCloudWatchRum } from './utils/cloudWatch-rum.ts'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import 'simplebar-react/dist/simplebar.min.css'

configureAmplify()

initCloudWatchRum()

const queryClient = new QueryClient()

function App() {
  return (
    <AuthenticatorWrapper>
      {() => (
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeProvider>
              <ViewSettingsProvider
                defaultSettings={{
                  themeMode: 'light',
                  themeLayout: 'vertical',
                }}
              >
                <SnackbarContextProvider>
                  <CssBaseline />
                  <Router>
                    <Layout />
                  </Router>
                </SnackbarContextProvider>
              </ViewSettingsProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </QueryClientProvider>
      )}
    </AuthenticatorWrapper>
  )
}

export default App
