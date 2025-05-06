// app/portfolio/[id]/page.tsx
import { PdfViewerClient } from "@/components/PdfViewerClient";
import { notFound } from "next/navigation";

interface ProjectDetailPageProps {
  params: {
    id?: string;
  };
}

async function fetchPdfUrl(fileId: string): Promise<string | null> {
  try {
    // Construct the absolute URL for fetching from a Server Component
    // If your API is internal, you might fetch data directly without an HTTP call.
    // For this example, we assume an API endpoint that serves the PDF.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/projects/${fileId}`, {
      cache: "no-store", // Or configure caching as appropriate
    });

    if (!res.ok) {
      // Log the error or handle it more gracefully
      console.error(`Error fetching PDF: ${res.status} ${res.statusText}`);
      const errorBody = await res.text();
      console.error(`Error body: ${errorBody}`);
      return null;
    }

    // react-pdf-viewer can take the API route URL directly if it serves the PDF file.
    // No need to create a blob URL here.
    return `${baseUrl}/api/projects/${fileId}`;
  } catch (err) {
    console.error("Exception fetching PDF URL:", err);
    return null;
  }
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const fileId = params.id;

  if (!fileId) {
    notFound(); // Or return a custom error component
    return;
  }

  const pdfUrl = await fetchPdfUrl(fileId);

  if (!pdfUrl) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Project PDF</h1>
        <div className="text-red-500">
          Error loading PDF: Could not fetch PDF content. Please ensure the
          project ID is correct and the API is working.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Project Document</h1>
      {/*
        The PdfViewerClient component will handle the actual PDF rendering and controls.
        It needs to be a client component because react-pdf-viewer interacts with the DOM
        and uses browser APIs.
      */}
      <PdfViewerClient pdfUrl={pdfUrl} />
    </div>
  );
}
