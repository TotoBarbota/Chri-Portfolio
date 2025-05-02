// lib/use-content.ts
import { useEffect, useState } from "react";
import { DriveFile } from "./google-drive";

export function useContentProjects() {
  console.log("Called useContentProjects");
  const [projects, setProjects] = useState<
    {
      id: string;
      name: string;
      type: string;
      lastModified: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log("Fetching projects content");
        const response = await fetch("/api/content/projects", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        console.log("Projects data:", data);

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch projects content");
        }

        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { projects, loading, error };
}

export async function useProject(fileId: string) {
  const [project, setProject] = useState<DriveFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log(`Fetching project file ${fileId}`);
        const response = await fetch(`/api/projects/${fileId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || `Failed to fetch project file ${fileId}`
          );
        }

        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [fileId]);

  return { project, loading, error };
}
