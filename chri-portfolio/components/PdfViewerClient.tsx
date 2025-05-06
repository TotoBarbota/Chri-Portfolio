// components/PdfViewerClient.tsx
"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { useEffect, useState } from "react";

interface PdfViewerClientProps {
  pdfUrl: string;
}

export const PdfViewerClient: React.FC<PdfViewerClientProps> = ({ pdfUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [currentPdfUrl, setCurrentPdfUrl] = useState(pdfUrl);

  useEffect(() => {
    setCurrentPdfUrl(pdfUrl);
  }, [pdfUrl]);

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <div
        style={{
          border: "1px solid rgba(0, 0, 0, 0.3)",
          height: "calc(100vh - 150px)",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {currentPdfUrl && (
          <Viewer
            fileUrl={currentPdfUrl}
            plugins={[defaultLayoutPluginInstance]}
          />
        )}
      </div>
    </Worker>
  );
};
