import { useState } from 'react';

export function useZoom() {
  const [scale, setScale] = useState(1.0);
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  return { scale, zoomIn, zoomOut };
}
