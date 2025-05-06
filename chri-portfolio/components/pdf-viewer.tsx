// compoments/pdf-vierwer.tsx

interface PdfViewerProps {
  url: string;
}

export const PdfViewer = ({ url }: PdfViewerProps) => {
  // Extract the file ID from the URL
  const fileId = url.split("/").find((part) => part.startsWith("1")) || "";
  const pdfUrl = `https://drive.google.com/embeddedviewer?id=${fileId}`;

  return (
    <div className="w-full h-full">
      <iframe
        src={pdfUrl}
        width="100%"
        height="600px"
        allow="fullscreen"
        allowFullScreen
        title="PDF Viewer"
        sandbox="allow-scripts allow-same-origin allow-popups"
      ></iframe>
    </div>
  );
};
