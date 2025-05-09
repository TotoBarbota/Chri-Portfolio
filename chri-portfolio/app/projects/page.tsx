import { Suspense } from "react";
import { ProjectsList } from "@/components/projects-list";
import { ContentLoadingSkeleton } from "@/components/content-loading-skeleton";
import { Fade } from "@/components/motion";

type ProjectsPageProps = Promise<{ searchParams: { view?: string } }>;

// Define the type for the data fetched from the list API
interface ProjectListItem {
  id: string;
  name: string;
  modifiedTime?: string;
  description?: string;
  thumbnailUrl?: string;
}

async function getProjects(): Promise<ProjectListItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/projects`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure fresh data on each request
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const errorMessage =
        errorData?.message ||
        `Failed to fetch projects (Status: ${res.status})`;
      throw new Error(errorMessage);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format: expected array");
    }
    return data.map((post: ProjectListItem) => ({
      ...post,
      name: post.name.replace(/\.pdf$/, ""),
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}

async function ProjectsContent() {
  const projects = await getProjects();
  return <ProjectsList projects={projects} />;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: ProjectsPageProps;
}) {
  const { view } = (await searchParams).searchParams;
  const viewMode = view === "list" ? "list" : "card-small";

  return (
    <div>
      {/* Non-suspended content */}
      <div className="py-12">
        <Fade direction="up" className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            My Projects
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A showcase of strategic initiatives and business transformations
            I&apos;ve led.
          </p>
        </Fade>

        {/* Suspended content */}
        <Suspense fallback={<ContentLoadingSkeleton viewMode={viewMode} />}>
          <ProjectsContent />
        </Suspense>
      </div>
    </div>
  );
}
