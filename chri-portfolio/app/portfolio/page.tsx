// app/projects/page.tsx (Assuming App Router)
// If using Pages Router: pages/projects.tsx

"use client"; // Client Component

import { useEffect, useState, FC } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image component for optimized images

// Define the type for the data fetched from the list API
// ADDED description and thumbnailLink
interface ProjectListItem {
  id: string;
  name: string;
  modifiedTime?: string;
  description?: string; // Include description
  thumbnailLink?: string; // Include thumbnailLink
}

const ProjectsPage: FC = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          const errorMessage =
            errorData?.message || `Error fetching projects: ${res.status}`;
          throw new Error(errorMessage);
        }
        const data: ProjectListItem[] = await res.json(); // Type the fetched data
        setProjects(data);
        console.log(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;
  if (projects.length === 0) return <div>No projects found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Projects</h1>

      <ul className="space-y-6">
        {" "}
        {/* Increased spacing */}
        {projects.map((project) => (
          <li key={project.id} className="border-b pb-6 flex items-start gap-6">
            {" "}
            {/* Use flex for layout */}
            {/* Display Thumbnail if available */}
            {project.thumbnailLink ? (
              <div className="w-32 h-auto flex-shrink-0">
                {" "}
                {/* Fixed width container for thumbnail */}
                {/* Use Next.js Image component for optimization */}
                <Image
                  src={project.thumbnailLink}
                  alt={`Thumbnail for ${project.name}`}
                  width={128} // Set appropriate width
                  height={96} // Set appropriate height (aspect ratio might vary)
                  layout="intrinsic" // Or "responsive" if you want it to fill container
                  objectFit="cover" // Crop if aspect ratio doesn't match
                  className="rounded-md shadow-sm" // Basic styling
                />
              </div>
            ) : (
              // Optional: Placeholder if no thumbnail
              <div className="w-32 h-24 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-sm text-gray-500">
                No Thumbnail
              </div>
            )}
            {/* Project Info */}
            <div className="flex-grow">
              <Link
                href={`/portfolio/${project.id}`}
                className="text-xl font-semibold text-blue-600 hover:underline"
              >
                {project.name}
              </Link>
              {/* Display Description if available */}
              {project.description && (
                <p className="text-gray-700 mt-2 text-sm">
                  {project.description}
                </p>
              )}
              {/* Optional: Display modified time */}
              {project.modifiedTime && (
                <p className="text-gray-500 text-xs mt-2">
                  Last updated:{" "}
                  {new Date(project.modifiedTime).toLocaleDateString()}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsPage;
