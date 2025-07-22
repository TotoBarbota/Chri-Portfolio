"use client";

import { useState } from "react";
import { Fade, FadeGroup } from "@/components/motion";
import { ViewMode, ViewToggle } from "@/components/view-toggle";
import { Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

interface ProjectListItem {
  id: string;
  name: string;
  modifiedTime?: string;
  description?: string;
  thumbnailUrl?: string;
}

interface ProjectsListProps {
  projects: ProjectListItem[];
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("card-small");

  return (
    <>
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
                    src={project.thumbnailUrl || "/Dummy-Thumbnail.png"}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="md:w-2/3 flex flex-col">
                  <h2 className="text-2xl font-bold">{project.name}</h2>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="mr-1 h-4 w-4" />
                    {project.modifiedTime
                      ? `Last modified: ${
                          new Date(project.modifiedTime)
                            .toISOString()
                            .split("T")[0]
                        }`
                      : ""}
                  </div>
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
                  className={`relative w-full overflow-hidden 
                    ${viewMode === "card-large" ? "h-64" : "h-48"}`}
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
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="mr-1 h-4 w-4" />
                    <p>Last Modified: </p>
                    {project.modifiedTime
                      ? `Last modified: ${
                          new Date(project.modifiedTime)
                            .toISOString()
                            .split("T")[0]
                        }`
                      : ""}
                  </div>
                  {/* <CardDescription></CardDescription> */}
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2">
                    {project.description}
                  </div>
                </CardContent>
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
                      Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </Fade>
          ))}
        </FadeGroup>
      )}
    </>
  );
}
