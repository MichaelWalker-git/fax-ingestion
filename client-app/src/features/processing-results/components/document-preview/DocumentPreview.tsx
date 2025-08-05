import CircularLoader from '../../../../shared/components/loader/CircularLoader.tsx';
import { Alert } from '@mui/material';
import Stack from '@mui/material/Stack';
import { PdfViewer } from '../../../../shared/components/pdf-viewer/PdfViewer.tsx';

interface DocumentPreviewProps {
  fileFormat?: string;
  presignUrl?: string;
  isLoading: boolean;
  error: any;
  scale: number;
}

export default function DocumentPreview({
  presignUrl,
  isLoading,
  error,
  scale,
}: DocumentPreviewProps) {
  return (
    <>
      {isLoading && <CircularLoader text="Loading document preview..." />}
      {error && <Alert severity="error">{error?.message}</Alert>}
      {presignUrl && (
        <>
          <Stack
            alignItems="center"
            sx={{ height: 'calc(100vh - 120px)', overflowY: 'auto', overflowX: 'hidden' }}
          >
            <PdfViewer url={presignUrl} scale={scale} />
          </Stack>
        </>
      )}
    </>
  );
}
