import ThemeProvider from './theme/Index.tsx';
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import MainLayout from './shared/components/layout/main-layout.tsx';
import { paths } from './routes/paths.ts';
import {lazy, useEffect, useState} from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/query-client.ts';
import SnackbarProvider from './shared/components/snackbar/snackbar-provider.tsx';
import ProcessingResultView from './features/processing-results/pages/ProcessingResultView.tsx';

import {AuthProvider, useAuth} from "./context/AuthContext";
import { configureApiClient } from './api/api-config.ts';
import LoginForm from './features/auth/components/LoginForm.tsx';
import NewPasswordForm from './features/auth/components/NewPasswordForm.tsx';

const ProcessingResultsListView = lazy(
    () => import('./features/processing-results/pages/ProcessingResultsListView.tsx')
);

function ProtectedApp() {
  const { user, authStep } = useAuth();
  if (authStep === "login") return <LoginForm />;
  if (authStep === "newPassword") return <NewPasswordForm />;
  return                 <HashRouter>
    <Routes>
      <Route
          path="/"
          element={<Navigate to={paths.processingResults.root} replace />}
      />
      <Route path="/" element={<MainLayout />}>
        <Route path={paths.processingResults.root}>
          <Route index element={<ProcessingResultsListView />} />
          <Route
              path={paths.processingResults.view}
              element={<ProcessingResultView />}
          />
        </Route>
      </Route>
    </Routes>
  </HashRouter>;
}

function App() {
  const [config, setConfig] = useState<any>(null);

  console.log('config', config)

  useEffect(() => {
    fetch('./config.json')
        .then((response) => response.json())
        .then((data) => {
          setConfig(data);
          configureApiClient(data.API_ENDPOINT);
        })
        .catch(() => setConfig({ error: 'Could not load config' }));
  }, []);

  if (!config || config.error) return <div>Loading or error loading config</div>;

  return (
      <AuthProvider config={config}>
        <ThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <SnackbarProvider>
              <QueryClientProvider client={queryClient}>
              <ProtectedApp />
              </QueryClientProvider>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </AuthProvider>
  );
}

export default App;
