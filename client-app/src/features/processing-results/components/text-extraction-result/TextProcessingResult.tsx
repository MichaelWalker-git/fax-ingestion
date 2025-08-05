import { useFetchTextProcessingResult } from '../../api/actions/text-processing-results.ts';
import { useState } from 'react';
import { Alert, Typography } from '@mui/material';
import CircularLoader from '../../../../shared/components/loader/CircularLoader.tsx';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { IDocument } from '../../../../types/IDocument.ts';
import TextExtractionNodeResult from './TextExtractionNodeResult.tsx';

interface ProcessingResultProps {
  document: IDocument;
}

export default function TextProcessingResult({ document }: ProcessingResultProps) {
  const {
    isLoading,
    error,
    data: textProcessingResult,
  } = useFetchTextProcessingResult(document.textResultPresignedUrl);

  const [showText, setShowText] = useState(true);

  return (
    <>
      <Stack gap={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" p="4px">
            Extracted Pages:
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2">Fields</Typography>
            <Switch
              checked={showText}
              onChange={() => {
                setShowText((prevState: boolean) => !prevState);
              }}
              sx={{
                '& .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                },
                '& .MuiSwitch-thumb': {
                  color: 'white',
                },
              }}
            />
            <Typography variant="subtitle2">Text</Typography>
          </Stack>
        </Stack>
        {error && <Alert severity="error">{error.message}</Alert>}
        {isLoading && <CircularLoader text="Loading Processing result..." />}
        {document &&
          (!textProcessingResult || !document.textResultPresignedUrl) &&
          !isLoading &&
          !error && <Alert severity="warning"> There is no processing result yet </Alert>}
        <Stack gap={2}>
          {textProcessingResult &&
            textProcessingResult.map((documentResult: any) => (
              <TextExtractionNodeResult
                key={documentResult.page}
                processingDocument={documentResult}
                showText={showText}
              />
            ))}
        </Stack>
      </Stack>
    </>
  );
}
