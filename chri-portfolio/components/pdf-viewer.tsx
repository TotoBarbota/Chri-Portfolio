import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState } from "react";
import styles from "./pdf-viewer.module.css";

interface PdfViewerProps {
  url: string;
}

export const PdfViewer = ({ url }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className={styles["pdf-viewer-container"]}>
      <div className={styles["pdf-controls"]}>
        <button
          onClick={() => setPageNumber((prev) => (prev > 1 ? prev - 1 : prev))}
          disabled={pageNumber <= 1}
        >
          Previous
        </button>
        <span>
          Page {pageNumber} of {numPages}
        </span>
        <button
          onClick={() =>
            setPageNumber((prev) => (prev < numPages ? prev + 1 : prev))
          }
          disabled={pageNumber >= numPages}
        >
          Next
        </button>
      </div>
      <div className={styles["pdf-viewer"]}>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div>Loading PDF...</div>}
        >
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
    </div>
  );
};
