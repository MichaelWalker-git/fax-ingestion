import { Box, Card, Container, IconButton, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router';
import { useFetchDocument } from '../api/actions/processing-results.ts';
import Stack from '@mui/material/Stack';
import Iconify from '../../../shared/components/iconify';
import { paths } from '../../../routes/paths.ts';
import { getFileFormat } from '../../../utils/files.ts';
import DocumentPreview from '../components/document-preview/DocumentPreview.tsx';
import ProcessingReviewForm from '../components/procesing-review-form/ProcessingReviewForm.tsx';
import DownloadButton from '../../../shared/components/download-button/DownloadButton.tsx';

import ProcessingResult from '../components/processing-result/ProcessingResult.tsx';
import { useZoom } from '../../../hooks/useZoom.ts';

export default function ProcessingResultView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(paths.processingResults.root);
  };

  const { data: document, isLoading, error } = useFetchDocument(id);

  const fileFormat = getFileFormat(document?.filename);

  const { scale, zoomIn, zoomOut } = useZoom();

  if (!id) {
    return null;
  }

  return (
    <Container sx={{ pb: '0 !important', pt: '8px !important' }}>
      <Stack direction="row" mb={1}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ width: '50%' }}>
          <IconButton onClick={handleBack}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>
          <Typography variant="h5">Original Document</Typography>
          {document?.filePresignedUrl && (
            <>
              <DownloadButton url={document?.filePresignedUrl} filename={document?.filename} />
              <Box>
                <IconButton disabled={scale <= 0.5}>
                  <Iconify icon="ic:baseline-minus" onClick={zoomOut} />
                </IconButton>
                <span style={{ margin: '0 1rem' }}>Zoom: {(scale * 100).toFixed(0)}%</span>
                <IconButton disabled={scale >= 3.0}>
                  <Iconify icon="ic:baseline-plus" onClick={zoomIn} />
                </IconButton>
              </Box>
            </>
          )}
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          sx={{ width: '50%' }}
        >
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" mx={2}>
              Processing Result
            </Typography>
            {document?.resultPresignedUrl && (
              <DownloadButton
                url={document?.resultPresignedUrl}
                filename={`${document?.filename}_processing-result`}
                extension="json"
              />
            )}
          </Stack>
        </Stack>
      </Stack>
      <Stack direction="row" gap={3} sx={{ height: '100%' }}>
        <Card sx={{ width: '50%', height: '100%', p: 2, maxHeight: '88vh' }}>
          <DocumentPreview
            fileFormat={fileFormat}
            presignUrl={document?.filePresignedUrl}
            isLoading={isLoading}
            error={error}
            scale={scale}
          />
        </Card>
        <Card
          sx={{
            width: '50%',
            height: '88vh',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {document && (
            <Stack direction="column" gap={2} maxHeight="74%" sx={{ overflowY: 'auto' }}>
              <ProcessingResult document={document} />
            </Stack>
          )}
          <Stack>
            <ProcessingReviewForm documentId={id} reviewComment={document?.reviewComment} />
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
