"use client";
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

const PortfolioDetailPage: FC = () => {
  // Use useRouter for Pages Router, useParams for App Router
  const params = useParams();
  const { id } = params as { id?: string | string[] }; // Type router.query

  const fileId = Array.isArray(id) ? id[0] : id; // Get the single ID string

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0); // *** Added Scale State ***
  const [pageInput, setPageInput] = useState<string>("1"); // *** Added state for page jump input ***

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
      }
    };
  }, [fileId]);

  const onDocumentLoadSuccess = ({ numPages }: DocumentLoadSuccess): void => {
    setNumPages(numPages);
    setPageNumber(1);
    setPageInput("1"); // Reset page input

    // Optional: Calculate initial scale to fit container width
    if (containerRef.current) {
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      // You might need to get the first page's width here to calculate accurately,
      // or use a library helper. For simplicity, start with a fixed scale or
      // set scale later based on page render.
      // A common initial scale is 1.0 or trying to fit width.
      // Let's stick to 1.0 default for now unless you need auto-fit.
    }
  };

  const changePage = (offset: number) => {
    if (numPages === null) return;
    const newPage = Math.max(1, Math.min(numPages, pageNumber + offset));
    setPageNumber(newPage);
    setPageInput(String(newPage)); // Update input value
  };

  const goToPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
    if (numPages === null) return;
    const inputPage = parseInt(pageInput, 10);
    if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= numPages) {
      setPageNumber(inputPage);
    } else {
      // Optionally show an error or reset input if invalid
      alert(`Please enter a page number between 1 and ${numPages}`);
      setPageInput(String(pageNumber)); // Reset input to current page
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const zoomIn = () => setScale((prevScale) => prevScale * 1.1); // Increase scale by 10%
  const zoomOut = () => setScale((prevScale) => Math.max(0.5, prevScale * 0.9)); // Decrease scale, min 0.5

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
        <button onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
          Previous
        </button>
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
          />
          <span>of {numPages ?? "..."}</span>
          <button type="submit" style={{ display: "none" }}>
            Go
          </button>{" "}
          {/* Hidden submit button */}
        </form>
        <button
          onClick={() => changePage(1)}
          disabled={numPages === null || pageNumber >= numPages}
        >
          Next
        </button>
        {/* Zoom Controls */}
        <span style={{ marginLeft: "20px" }}>Zoom:</span>
        <button onClick={zoomOut}>-</button>
        <span>{Math.round(scale * 100)}%</span>{" "}
        {/* Display scale as percentage */}
        <button onClick={zoomIn}>+</button>
        {/* Search Placeholder */}
        {/* Search functionality is more complex, requires text extraction and highlighting */}
        <span style={{ marginLeft: "20px", fontStyle: "italic" }}>
          Search not implemented yet
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
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => {
            console.error("react-pdf error:", err);
            setError("Failed to render PDF."); // Set a user-friendly error
          }}
          // options={/* Add options like disableWorker: true if worker causes issues */}
        >
          {/* Render only the current page */}
          <Page
            pageNumber={pageNumber}
            scale={scale} // *** Pass Scale to Page Component ***
            // Add event listeners here if needed, e.g., onLoadSuccess for individual page
          />
          {/* If you wanted to render all pages, you'd loop through them here
             {[...Array(numPages || 0)].map((_, index) => (
               <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale} />
             ))}
           */}
        </Document>
      </div>
    </div>
  );
};

export default PortfolioDetailPage;
