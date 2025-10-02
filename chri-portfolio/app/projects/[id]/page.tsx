import { PdfViewerClient } from "@/components/PdfViewerClient";
import { notFound } from "next/navigation";
import { JSX } from "react";

type ProjectDetailPageProps = Promise<{ id: string }>;

interface ProjectMetadata {
  name: string;
  modifiedTime: string;
  webViewLink: string;
}

async function fetchProjectMetadata(
  fileId: string
): Promise<ProjectMetadata | null> {
  try {
    // Use VERCEL_URL for the current deployment (works for preview branches too)
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    console.log(
      `[fetchProjectMetadata] Fetching from: ${baseUrl}/api/projects/${fileId}/metadata`
    );

    const res = await fetch(`${baseUrl}/api/projects/${fileId}/metadata`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `[fetchProjectMetadata] Error: ${res.status} ${res.statusText}`
      );
      // Log response body for debugging
      const errorText = await res
        .text()
        .catch(() => "Unable to read error response");
      console.error(`[fetchProjectMetadata] Response body: ${errorText}`);
      return null;
    }

    const data = await res.json();
    console.log(
      `[fetchProjectMetadata] Successfully fetched metadata for: ${data.name}`
    );
    return data;
  } catch (err) {
    console.error("[fetchProjectMetadata] Exception:", err);
    return null;
  }
}
export default async function ProjectDetailPage({
  params,
}: {
  params: ProjectDetailPageProps;
}): Promise<JSX.Element | null> {
  const { id } = await params;
  const fileId = id;

  if (!fileId) {
    notFound();
  }

  // Try to get metadata, but don't fail if it's not available
  const metadata = await fetchProjectMetadata(fileId);

  // Use relative URL for PDF so it works on all deployments (preview, production, local)
  const pdfUrl = `/api/projects/${fileId}`;

  // Even if metadata fails, we can still show the PDF
  // The PDF viewer will handle 404 if the file doesn't exist
  return (
    <div className="container mx-auto p-4">
      {metadata && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{metadata.name}</h1>
          {metadata.modifiedTime && (
            <p className="text-sm text-gray-500">
              Last updated:{" "}
              {new Date(metadata.modifiedTime).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
      <div className="border rounded-lg overflow-hidden">
        <PdfViewerClient pdfUrl={pdfUrl} />
      </div>
    </div>
  );
}
