import { Suspense } from "react";
import { ProjectsList } from "@/components/projects-list";
import { ContentLoadingSkeleton } from "@/components/content-loading-skeleton";
import { Fade } from "@/components/motion";
import { listProjects } from "@/lib/local-files";

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
    const projects = await listProjects();

    return projects.map((project) => ({
      id: project.id,
      name: project.name.replace(/\.pdf$/, ""),
      modifiedTime: project.modifiedTime,
      description: project.description,
      thumbnailUrl: project.thumbnailPath,
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
  const view = (await searchParams)?.searchParams?.view;
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
            A collection of research essays and academic projects I&apos;ve
            completed.
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
