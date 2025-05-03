import { useEffect, useState } from "react";
import { PdfViewer } from "./pdf-viewer";

interface ContentViewProps {
  id: string;
  type: "markdown" | "document";
}

export const ContentView = ({ id, type }: ContentViewProps) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Project ID not found");
      return;
    }

    const fetchContent = async () => {
      try {
        const apiUrl =
          type === "markdown" ? `/api/blogs/${id}` : `/api/projects/${id}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch content");
        }

        if (type === "markdown") {
          setContent(data.content);
        } else {
          setPdfUrl(data.url);
          console.log("Setting PDF URL:", data.url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, type]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (type === "markdown" && content) {
    return (
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  if (type === "document" && pdfUrl) {
    return <PdfViewer url={pdfUrl} />;
  }

  return null;
};
