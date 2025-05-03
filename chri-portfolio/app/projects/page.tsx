// app/projects/page.tsx (Assuming App Router)
// If using Pages Router: pages/projects.tsx

"use client"; // Client Component

import { useEffect, useState, FC } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image component for optimized images
import { Fade, FadeGroup } from "@/components/motion";
import { ViewMode, ViewToggle } from "@/components/view-toggle";
import { Badge, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define the type for the data fetched from the list API
interface ProjectListItem {
  id: string;
  name: string;
  modifiedTime?: string;
  description?: string;
  thumbnailUrl?: string; // Include thumbnailUrl
}

const ProjectsPage: FC = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("card-small");

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
        data.map((post) => (post.name = post.name.replace(/\.pdf$/, "")));
        setProjects(data);
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
    <div className="py-12">
      <Fade direction="up" className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          My Projects
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A showcase of strategic initiatives and business transformations I've
          led.
        </p>
      </Fade>

      <div className="flex justify-end mb-6">
        <ViewToggle
          onChange={setViewMode}
          defaultValue="card-small"
          storageKey="portfolio-view-mode"
        />
      </div>

      {viewMode === "list" ? (
        <FadeGroup className="space-y-6" staggerDelay={0.15}>
          {projects.map((project) => (
            <Fade key={project.id}>
              <div className="flex flex-col md:flex-row gap-6 border rounded-lg p-4 hover:shadow-md transition-all hover:border-primary/50">
                <div className="md:w-1/3 h-48 relative rounded-md overflow-hidden">
                  <Image
                    src={project.thumbnailUrl || "/placeholder.svg"}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="md:w-2/3 flex flex-col">
                  <h2 className="text-2xl font-bold">{project.name}</h2>
                  <p className="text-muted-foreground mt-2 mb-4">
                    {project.description}
                  </p>
                  <div className="mt-auto flex gap-4">
                    <Button
                      asChild
                      size="sm"
                      className="transition-all hover:bg-primary/90"
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Read More
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Fade>
          ))}
        </FadeGroup>
      ) : (
        <FadeGroup
          className={`grid gap-8 ${
            viewMode === "card-small"
              ? "md:grid-cols-2 lg:grid-cols-3"
              : "md:grid-cols-1 lg:grid-cols-2"
          }`}
          staggerDelay={0.15}
        >
          {projects.map((project) => (
            <Fade key={project.id}>
              <Card className="overflow-hidden flex flex-col hover-scale">
                <div
                  className={`relative w-full overflow-hidden ${
                    viewMode === "card-large" ? "h-64" : "h-48"
                  }`}
                >
                  <Image
                    src={project.thumbnailUrl || "/placeholder.svg"}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <Button
                    asChild
                    size="sm"
                    className="transition-all hover:bg-primary/90"
                  >
                    <Link
                      href={`/projects/${project.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Read More
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </Fade>
          ))}
        </FadeGroup>
      )}
    </div>
  );
};

export default ProjectsPage;
