import { PdfViewerClient } from "@/components/PdfViewerClient";
import { notFound } from "next/navigation";

interface ProjectDetailPageProps {
  params: {
    id: Promise<string>;
  };
}

interface ProjectMetadata {
  name: string;
  modifiedTime: string;
  webViewLink: string;
}

async function fetchProjectMetadata(
  fileId: string
): Promise<ProjectMetadata | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/projects/${fileId}/metadata`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `Error fetching project metadata: ${res.status} ${res.statusText}`
      );
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Error fetching project metadata:", err);
    return null;
  }
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const fileId = await params.id;

  if (!fileId) {
    notFound();
  }

  const metadata = await fetchProjectMetadata(fileId);
  if (metadata) {
    metadata.name = metadata.name.replace(/\.[^.]+$/, "");
  }

  const pdfUrl = `/api/projects/${fileId}`;

  if (!metadata) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
        <p>Could not load project details. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{metadata.name}</h1>
        {metadata.modifiedTime && (
          <p className="text-sm text-gray-500">
            Last updated: {new Date(metadata.modifiedTime).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="border rounded-lg overflow-hidden">
        <PdfViewerClient pdfUrl={pdfUrl} />
      </div>
    </div>
  );
}
