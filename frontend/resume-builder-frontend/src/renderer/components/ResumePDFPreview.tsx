import { Box, IconButton, Stack, Typography } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export enum ResumePreviewScaleEnum {
  FULL_WIDTH = 'full_width',
  FULL_HEIGHT = 'full_height',
  CUSTOM = 'custom',
}

type ResumePDFPreviewProps = {
  preview: string;
  renderAllPages?: boolean;
  scaleType: ResumePreviewScaleEnum;
  scale?: number;
};

export default function ResumePDFPreview(props: ResumePDFPreviewProps) {
  const { preview, renderAllPages, scale = 1, scaleType } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  const [pdf, setPdf] = useState<PDFDocumentProxy>(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdf) return;

    pdf.getPage(1).then((page) => {
      const viewport = page.getViewport({ scale: 1 });

      setPageSize({
        width: viewport.width,
        height: viewport.height,
      });
    });
  }, [pdf]);

  const onDocumentLoadSuccess = useCallback(
    (pdf) => {
      setPdf(pdf);
      setPages(pdf.numPages);
      if (pdf.numPages !== 0 && currentPage > pdf.numPages) {
        setCurrentPage(pdf.numPages);
      }
    },
    [currentPage],
  );

  const calculatedScale = useMemo(() => {
    if (!pageSize.width || !containerSize.width) return 1;

    switch (scaleType) {
      case ResumePreviewScaleEnum.FULL_WIDTH:
        return containerSize.width / pageSize.width;

      case ResumePreviewScaleEnum.FULL_HEIGHT:
        return containerSize.height / pageSize.height;

      case ResumePreviewScaleEnum.CUSTOM:
        return (containerSize.width / pageSize.width) * scale;

      default:
        return 1;
    }
  }, [
    pageSize.width,
    pageSize.height,
    containerSize.width,
    containerSize.height,
    scaleType,
    scale,
  ]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {renderAllPages ? (
        <>
          <Box
            ref={containerRef}
            sx={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              backgroundColor: '#eeeeee',
              p: 2,
            }}
          >
            <Document file={preview} onLoadSuccess={onDocumentLoadSuccess}>
              <Page
                pageNumber={currentPage}
                scale={calculatedScale}
                renderAnnotationLayer={false}
              />
            </Document>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{
              p: 1,
              borderTop: 1,
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <IconButton
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage <= 1}
            >
              <NavigateBeforeIcon />
            </IconButton>

            <Typography>
              {currentPage} / {pages}
            </Typography>

            <IconButton
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= pages}
            >
              <NavigateNextIcon />
            </IconButton>
          </Stack>
        </>
      ) : (
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            backgroundColor: '#eeeeee',
            p: 2,
          }}
        >
          <Document file={preview} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
              pageNumber={1}
              scale={calculatedScale}
              renderAnnotationLayer={false}
            />
          </Document>
        </Box>
      )}
    </Box>
  );
}
