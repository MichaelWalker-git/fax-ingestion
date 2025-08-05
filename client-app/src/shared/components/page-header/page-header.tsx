import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

interface PageHeaderProps {
  children: React.ReactNode;
  action?: React.ReactNode;
}

export default function PageHeader({ children, action }: PageHeaderProps) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
      <Typography variant="h4" gutterBottom>
        {children}
      </Typography>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Stack>
  );
}
