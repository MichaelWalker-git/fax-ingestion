import { IconButton as MuiIconButton, Tooltip } from '@mui/material';
import Iconify from '../iconify';

interface DownloadButtonProps {
  url: string;
  filename?: string;
  extension?: string;
}

export default function DownloadButton({ url, filename, extension = 'pdf' }: DownloadButtonProps) {
  const downloadFile = async () => {
    const response = await fetch(url);
    const blob = await response.blob();
    download(blob, `${filename}.${extension}` || `file.${extension}`);
  };

  return (
    <Tooltip title="Download">
      <MuiIconButton onClick={downloadFile} color="inherit" size="large">
        <Iconify icon="material-symbols:download" />
      </MuiIconButton>
    </Tooltip>
  );
}

export function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
