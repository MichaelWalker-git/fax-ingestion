export const getFileFormat = (filename?: string) => {
  if (!filename) {
    return;
  }
  const parts = filename.split('.');
  return parts.length > 1 ? parts?.pop()?.toLowerCase() : undefined;
};

export const isFileImage = (format?: string) => {
  if (!format) {
    return false;
  }
  return ['jpg', 'jpeg', 'png'].includes(format);
};

export const isFilePdf = (format?: string) => {
  if (!format) {
    return false;
  }
  return ['pdf'].includes(format);
};
