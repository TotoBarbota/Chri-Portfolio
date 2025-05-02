"use client";

import { useContentProjects } from "@/lib/use-content";
import { Fade, FadeGroup } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ViewToggle, ViewMode } from "@/components/view-toggle";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { DriveFile } from "@/lib/google-drive";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PortfolioPage() {
  const [projects, setProjects] = useState<DriveFile[]>([]); // Type the state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) {
          // Check if response is JSON and has a message
          const errorData = await res.json().catch(() => null);
          const errorMessage =
            errorData?.message || `Error fetching projects: ${res.status}`;
          throw new Error(errorMessage);
        }
        const response = await res.json();
        const data: DriveFile[] = response.data || [];
        setProjects(data);
        console.log(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []); // Empty dependency array means this runs once on mount
  const [viewMode, setViewMode] = useState<ViewMode>("card-small");

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (!projects) {
    return <div className="text-center py-8">No projects found</div>;
  }

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
                  {/* <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  /> */}
                </div>
                <div className="md:w-2/3 flex flex-col">
                  <h2 className="text-2xl font-bold">{project.name}</h2>
                  <p className="text-muted-foreground mt-2 mb-4">
                    {/* {project.description} */} something something
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {/* {project.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="transition-all hover:bg-primary/20"
                      >
                        {tag}
                      </Badge>
                    ))} */}
                  </div>
                  <div className="mt-auto flex gap-4">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="transition-all hover:bg-secondary/80"
                    >
                      <Link
                        href={`/portfolio/${project.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Details
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
                  {/* <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  /> */}
                </div>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  {/* <CardDescription>{project.description}</CardDescription> */}
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2">
                    {/* {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="transition-all hover:bg-primary/20"
                      >
                        {tag}
                      </Badge>
                    ))} */}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="transition-all hover:bg-secondary/80"
                  >
                    <Link
                      href={`/portfolio/${project.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Details
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
}
