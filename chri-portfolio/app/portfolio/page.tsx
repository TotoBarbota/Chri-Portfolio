"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fade, FadeGroup } from "@/components/motion";
import { ViewToggle, type ViewMode } from "@/components/view-toggle";

// Sample project data - replace with your actual projects
const projects = [
  {
    id: 1,
    title: "Brand Revitalization Campaign",
    description:
      "Led a comprehensive brand refresh that increased market recognition by 45% and customer engagement by 60%.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Branding", "Marketing", "Strategy", "Design"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com",
  },
  {
    id: 2,
    title: "Digital Transformation Initiative",
    description:
      "Spearheaded a company-wide digital transformation that streamlined operations and reduced costs by 30%.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Leadership", "Innovation", "Digital", "Strategy"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com",
  },
  {
    id: 3,
    title: "Market Expansion Strategy",
    description:
      "Developed and executed a market expansion strategy that resulted in 75% revenue growth in new territories.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Growth", "Strategy", "Market Analysis", "Business Development"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com",
  },
  {
    id: 4,
    title: "Brand Revitalization Campaign",
    description:
      "Led a comprehensive brand refresh that increased market recognition by 45% and customer engagement by 60%.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Branding", "Marketing", "Strategy", "Design"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com",
  },
  {
    id: 5,
    title: "Digital Transformation Initiative",
    description:
      "Spearheaded a company-wide digital transformation that streamlined operations and reduced costs by 30%.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Leadership", "Innovation", "Digital", "Strategy"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com",
  },
  {
    id: 6,
    title: "Market Expansion Strategy",
    description:
      "Developed and executed a market expansion strategy that resulted in 75% revenue growth in new territories.",
    image: "/placeholder.svg?height=300&width=600",
    tags: ["Growth", "Strategy", "Market Analysis", "Business Development"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com",
  },
];

export default function PortfolioPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("card-small");

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
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="md:w-2/3 flex flex-col">
                  <h2 className="text-2xl font-bold">{project.title}</h2>
                  <p className="text-muted-foreground mt-2 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="transition-all hover:bg-primary/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto flex gap-4">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="transition-all hover:bg-secondary/80"
                    >
                      <Link
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        Details
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="transition-all hover:bg-primary/90"
                    >
                      <Link
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Case Study
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
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="transition-all hover:bg-primary/20"
                      >
                        {tag}
                      </Badge>
                    ))}
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
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Details
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="transition-all hover:bg-primary/90"
                  >
                    <Link
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Case Study
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
