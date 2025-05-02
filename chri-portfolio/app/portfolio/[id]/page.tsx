// app/portfolio/[id]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { useContentProjects, useProject } from "@/lib/use-content";
import { ContentView } from "@/components/content-viewer";

export default async function ProjectPage() {
  const { id } = useParams();

  if (!id) {
    return <div className="text-center py-8">Project ID not found</div>;
  }

  const { project, error, loading } = await useProject(id as string);
  console.log("Project Page: ", project);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (!project) {
    return <div className="text-center py-8">Project not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{project?.name}</h1>
        <ContentView id={id as string} type="document" />
      </div>
    </div>
  );
}
