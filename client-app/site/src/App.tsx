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
import {useEffect, useState} from 'react'

configureAmplify()

initCloudWatchRum()

const queryClient = new QueryClient()

function App() {
  const [config, setConfig] = useState<any>(null);

  console.log('config', config)


  useEffect(() => {
    fetch('./config.json')
        .then((response) => response.json())
        .then(setConfig)
        .catch(() => setConfig({ error: 'Could not load config' }));
  }, []);

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
