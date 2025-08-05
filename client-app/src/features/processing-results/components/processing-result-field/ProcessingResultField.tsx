import Stack from '@mui/material/Stack';
import throttle from 'lodash.throttle';
import {
  Checkbox,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import { Icon } from '@iconify/react';
import { IProcessingResultField } from '../../../../types/ProcessingResult.ts';
import { useCallback, useState } from 'react';

interface ProcessingResultFieldProps {
  field: IProcessingResultField;
  onChange: (field: IProcessingResultField) => void;
  updating?: boolean;
}

export default function ProcessingResultField({
  field,
  onChange,
  updating,
}: ProcessingResultFieldProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedValue, setEditedValue] = useState<string | undefined>();

  const throttledApprove = useCallback(
    throttle(() => {
      onChange({ ...field, isApproved: !field.isApproved });
    }, 1000),
    [field, onChange]
  );

  const handleApprove = () => {
    throttledApprove();
  };

  return (
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
      <Box display="flex" alignItems="center" flex={1}>
        {editMode ? (
          <>
            <TextField
              value={editedValue ?? field.value}
              size="small"
              variant="standard"
              onChange={(e) => setEditedValue(e.target.value ?? '')}
            />
            <Tooltip title="Cancel">
              <IconButton onClick={() => setEditMode(false)} size="small">
                <Icon icon="material-symbols:close" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save">
              <IconButton
                onClick={() => {
                  onChange({ ...field, value: editedValue ?? '' });
                  setEditMode(false);
                }}
                size="small"
              >
                <Icon icon="material-symbols:check" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Typography variant="body2">
              {typeof field.value === 'string' ? field.value : JSON.stringify(field.value)}
            </Typography>
            <>
              {updating ? (
                <CircularProgress sx={{ width: '22px !important', height: '22px !important' }} />
              ) : (
                <>
                  {field.verified !== undefined && field.verified !== null && (
                    <>
                      {field.verified ? (
                        <Tooltip title="Verified by Smarty">
                          <IconButton size="small" color="success">
                            <Icon icon="gg:check-o" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Not verified by Smarty">
                          <IconButton size="small" color="warning">
                            <Icon icon="material-symbols:warning-outline" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  )}
                  {field.isValid === 'false' && !field.isApproved && (
                    <Tooltip title={field.validationError || 'Value is not valid'}>
                      <IconButton size="small" color="error">
                        <Icon icon="codicon:error" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {field.value && (
                    <Tooltip title="Copy text">
                      <IconButton
                        onClick={() => navigator.clipboard.writeText(field.value)}
                        size="small"
                      >
                        <Icon icon="solar:copy-line-duotone" />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title="Edit value">
                    <IconButton onClick={() => setEditMode(true)} size="small">
                      <Icon icon="tabler:edit" />
                    </IconButton>
                  </Tooltip>

                  {!field.value && (
                    <Tooltip
                      title={field.isApproved ? 'Empty field approved' : 'Approve empty field'}
                    >
                      <Checkbox
                        sx={{ p: 0.5 }}
                        onChange={handleApprove}
                        checked={field.isApproved}
                      />
                    </Tooltip>
                  )}
                </>
              )}
            </>
          </>
        )}
      </Box>
    </Stack>
  );
}
