import { Document, Page, pdfjs } from 'react-pdf';
import { useRef, useState } from 'react';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Props {
  url: string;
  scale: number;
}

export const PdfViewer = ({ url, scale }: Props) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPosition = useRef({ x: 0, y: 0 });

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    lastPosition.current = { ...position };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({
      x: lastPosition.current.x + dx,
      y: lastPosition.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: '84vh',
          overflow: 'hidden',
          border: '1px solid #ccc',
          cursor: isDragging.current ? 'grabbing' : 'grab',
          position: 'relative',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <Document
            file={url}
            onLoadSuccess={onLoadSuccess}
            onLoadError={(error) => console.error('PDF load error:', error)}
          >
            {Array.from(new Array(numPages || 0), (_, index) => (
              <Page key={index} pageNumber={index + 1} />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};
