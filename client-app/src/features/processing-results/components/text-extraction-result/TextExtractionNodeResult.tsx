import { useState } from 'react';
import Stack from '@mui/material/Stack';
import { IconButton, Tooltip, Typography } from '@mui/material';
import AccuracyComponent from '../../../../shared/components/AccuracyComponent.tsx';
import Iconify from '../../../../shared/components/iconify';
import Box from '@mui/material/Box';
import { Icon } from '@iconify/react';
import TextExtractionResult from './TextExtractionResult.tsx';

interface TextExtractionNodeResultProps {
  processingDocument: Record<any, any>;
  showText: boolean;
}

export default function TextExtractionNodeResult({
  processingDocument,
  showText,
}: TextExtractionNodeResultProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <Stack
      sx={{
        p: 1,
        border: '1px dashed #ccc',
        borderRadius: '8px',
        gap: 1,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" gap={1}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="body1" fontWeight="bold" p="4px">
              Page: {processingDocument?.page}
            </Typography>
            |
            {processingDocument?.textAccuracy !== undefined &&
              processingDocument?.textAccuracy !== null && (
                <AccuracyComponent
                  text="Extraction Accuracy:"
                  accuracy={processingDocument?.textAccuracy}
                />
              )}
            <Iconify icon="ic:baseline-check" color="primary.main" />
          </Stack>
        </Stack>
        <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
          <Iconify
            icon={isCollapsed ? 'ic:baseline-expand-more' : 'ic:baseline-expand-less'}
            sx={{ width: 20, height: 20 }}
            color="primary.main"
          />
        </IconButton>
      </Stack>
      {!isCollapsed && (
        <>
          {showText ? (
            <TextExtractionResult text={processingDocument?.text} />
          ) : (
            <Stack gap={2}>
              {processingDocument.fields?.map((field: any) => (
                <Stack
                  key={field.fieldName}
                  direction="row"
                  sx={{
                    border: '1px dashed #ccc',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Typography variant="body2" flex={1}>
                    {field.fieldName}
                  </Typography>
                  {field.value && (
                    <Box display="flex" alignItems="center" flex={1} gap={1}>
                      <Typography variant="body2">
                        {typeof field.value === 'string'
                          ? field.value
                          : JSON.stringify(field.value)}
                      </Typography>{' '}
                      <Tooltip title="Copy text">
                        <IconButton
                          onClick={() => navigator.clipboard.writeText(field.value)}
                          size="small"
                        >
                          <Icon icon="solar:copy-line-duotone" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
