import { CircularProgress, Typography } from '@mui/material';
import { useMemo } from 'react';
import Box from '@mui/material/Box';

interface TextExtractionResultProps2 {
  text?: object | string;
  loading?: boolean;
}

export default function TextExtractionResult({ text = '', loading }: TextExtractionResultProps2) {
  const textObject = useMemo(() => {
    if (Array.isArray(text)) {
      const sortedArray = text.sort((a, b) => (a.page > b.page ? 1 : -1));

      return sortedArray.map((t) => (typeof t === 'string' ? t : t.result)).join('\n\n\n');
    }
    return typeof text === 'string' ? text : JSON.stringify(text);
  }, [text]);

  return (
    <Box
      sx={{
        position: 'relative',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflowX: 'auto',
        p: 2,
      }}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Typography component="pre">{textObject || 'No text extracted'}</Typography>
      )}
    </Box>
  );
}
