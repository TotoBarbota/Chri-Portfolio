"use client";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
// app/portfolio/[id]/page.tsx
import { useParams } from "next/navigation"; // Use useParams from next/navigation for App Router
import { useEffect, useState, FC, useRef } from "react"; // Added useRef
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// *** Assuming you fixed the workerSrc import/path as discussed previously ***
// Make sure this points to your locally served worker file (e.g., /workers/pdf.worker.mjs)
pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.mjs"; // Update with your exact path

// Define type for react-pdf load success event
interface DocumentLoadSuccess {
  numPages: number;
}

const ProjectDetailPage: FC = () => {
  // Use useRouter for Pages Router, useParams for App Router
  const params = useParams();
  const { id } = params as { id?: string | string[] }; // Type router.query

  const fileId = Array.isArray(id) ? id[0] : id; // Get the single ID string

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<{ single: number; all: number }>({
    single: 1.0,
    all: 0.5,
  }); // Default scales
  const [pageInput, setPageInput] = useState<string>("1"); // *** Added state for page jump input ***
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"single" | "all">("single"); // Add view mode state

  const containerRef = useRef<HTMLDivElement>(null); // Ref to get container width for initial scale

  useEffect(() => {
    if (!fileId) {
      setLoading(false);
      setError("Project ID not provided.");
      return;
    }

    async function fetchAndDisplayPdf() {
      try {
        const res = await fetch(`/api/projects/${fileId}`);

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          const errorMessage =
            errorData?.message || `Error fetching PDF: ${res.status}`;
          throw new Error(errorMessage);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        setPdfUrl(url);
      } catch (err: any) {
        console.error("Error fetching PDF:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAndDisplayPdf();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        setNumPages(null);
        setPageNumber(1);
        setScale(1.0); // Reset scale too
        setPageInput("1"); // Reset input too
        setPdfDocument(null);
      }
    };
  }, [fileId]);

  const handleDocumentLoadSuccess = (pdfDocument: any) => {
    setPdfDocument(pdfDocument);
    setNumPages(pdfDocument.numPages);
    setPageNumber(1);
    setPageInput("1"); // Reset page input

    // In all pages mode, we don't need to change the page number
    if (viewMode === "single") {
      setPageNumber(1);
      setPageInput("1");
    }

    // Calculate initial scale to fit container width
    if (containerRef.current) {
      const containerWidth = containerRef.current.getBoundingClientRect().width;

      // Get the first page
      pdfDocument.getPage(1).then((page: any) => {
        const viewport = page.getViewport({ scale: 1.0 });
        const pageWidth = viewport.width;

        // Calculate scale for single page mode
        const singlePageScale = containerWidth / pageWidth;

        // Calculate scale for all pages mode
        // We want to fit 3 pages per row with some padding
        const pagesPerRow = 3;
        const pageSpacing = 20; // spacing between pages
        const totalSpacing = (pagesPerRow - 1) * pageSpacing;
        const availableWidth = containerWidth - totalSpacing;
        const allPagesScale = availableWidth / pagesPerRow / pageWidth;

        // Store both scales
        setScale({
          single: singlePageScale,
          all: allPagesScale,
        });
      });
    }
  };

  const changePage = (offset: number) => {
    if (numPages === null) return;

    const newPage = Math.max(1, Math.min(numPages, pageNumber + offset));
    setPageNumber(newPage);
    setPageInput(newPage.toString());
  };

  const goToPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
    const newPage = parseInt(pageInput, 10);
    if (isNaN(newPage) || newPage < 1 || (numPages && newPage > numPages))
      return;

    setPageNumber(newPage);
    setPageInput(newPage.toString());
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const zoomIn = () => {
    setScale((prevScale) => ({
      ...prevScale,
      single: prevScale.single * 1.2,
      all: prevScale.all * 1.2,
    }));
  };

  const zoomOut = () => {
    setScale((prevScale) => ({
      ...prevScale,
      single: prevScale.single * 0.8,
      all: prevScale.all * 0.8,
    }));
  };

  if (loading) return <div>Loading project...</div>;
  if (error) return <div>Error loading PDF: {error}</div>;
  if (!pdfUrl) return <div>PDF content not available.</div>;

  return (
    <div>
      <h1>Project PDF</h1> {/* You might fetch the project name too */}
      {/* Controls Area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {/* Page Navigation */}
        <Button
          variant="outline"
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
        >
          Previous
        </Button>
        <form
          onSubmit={goToPage}
          style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
        >
          <span>Page</span>
          <input
            type="number"
            min="1"
            max={numPages ?? undefined} // max attribute works with type="number"
            value={pageInput}
            onChange={handlePageInputChange}
            onBlur={goToPage as any} // Trigger jump on blur too, type assertion needed
            style={{ width: "50px", textAlign: "center" }}
            className="bg-background border border-input rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            disabled={viewMode === "all"}
          />
          <span>of {numPages ?? "..."}</span>
          <Button type="submit" className="hidden">
            Go
          </Button>{" "}
          {/* Hidden submit button */}
        </form>
        <Button
          onClick={() => changePage(1)}
          disabled={numPages === null || pageNumber >= numPages}
          variant="outline"
        >
          Next
        </Button>
        {/* Zoom Controls */}
        <span style={{ marginLeft: "20px" }}>Zoom:</span>
        <Button onClick={zoomOut} className="p-1" variant="ghost">
          <Minus className="h-4 w-4" />
        </Button>
        <span>{Math.round(scale.single * 100)}%</span>{" "}
        {/* Display scale as percentage */}
        <Button onClick={zoomIn} className="p-1" variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => {
            setViewMode((prevMode) =>
              prevMode === "single" ? "all" : "single"
            );
            if (viewMode === "all") {
              setPageNumber(1);
              setPageInput("1");
            }
          }}
          className="p-1"
          variant="ghost"
          title="Toggle view mode"
        >
          {viewMode === "single" ? "Single Page" : "All Pages"}
        </Button>
        <span className="ml-2 text-sm text-muted-foreground">
          {viewMode === "single"
            ? "Navigate pages"
            : "Switch to single page mode to navigate"}
        </span>
      </div>
      {/* PDF Viewer Area - Add ref here */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "80vh",
          overflow: "auto",
          border: "1px solid #ccc",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "10px",
          boxSizing: "border-box",
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={(err) => {
            console.error("react-pdf error:", err);
            setError("Failed to render PDF."); // Set a user-friendly error
          }}
        >
          {viewMode === "all" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
              }}
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={`page_${index + 1}`}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    maxWidth: "33%", // 33% for 3 columns
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  <Page
                    pageNumber={index + 1}
                    scale={scale.all} // Use the all pages scale
                    renderMode="svg"
                    renderTextLayer={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale.single} // Use the single page scale
                renderMode="svg"
                renderTextLayer={true}
              />
            </div>
          )}
        </Document>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
