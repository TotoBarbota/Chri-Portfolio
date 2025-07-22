"use client";

import { useState } from "react";
import { Fade, FadeGroup } from "@/components/motion";
import { ViewMode, ViewToggle } from "@/components/view-toggle";
import { ArrowRight, Calendar } from "lucide-react";
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

interface BlogListItem {
  id: string;
  name: string;
  modifiedTime?: string;
  description?: string;
  thumbnailUrl?: string;
  readTime?: string;
}

interface BlogsListProps {
  blogs: BlogListItem[];
}

export function BlogsList({ blogs }: BlogsListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("card-small");

  return (
    <>
      <div className="flex justify-end mb-6">
        <ViewToggle
          onChange={setViewMode}
          defaultValue="card-small"
          storageKey="blog-view-mode"
        />
      </div>

      {viewMode === "list" ? (
        <FadeGroup className="space-y-6" staggerDelay={0.15}>
          {blogs.map((blog) => (
            <Fade key={blog.id}>
              <div className="flex flex-col md:flex-row gap-6 border rounded-lg p-4 hover:shadow-md transition-all hover:border-primary/50">
                <div className="md:w-1/3 h-48 relative rounded-md overflow-hidden">
                  <Image
                    src={blog.thumbnailUrl || "/Dummy-Thumbnail.png"}
                    alt={blog.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <h2 className="text-2xl font-bold">{blog.name}</h2>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="mr-1 h-4 w-4" />
                    {blog.modifiedTime
                      ? `Last modified: ${
                          new Date(blog.modifiedTime)
                            .toISOString()
                            .split("T")[0]
                        }`
                      : ""}
                  </div>
                  <p className="text-muted-foreground mt-2 mb-4">
                    {blog.description}
                  </p>
                  <div className="mt-auto">
                    <Button asChild className="group">
                      <Link href={`/blogs/${blog.id}`}>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
          className={`grid grid-cols-1 ${
            viewMode === "card-small"
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "lg:grid-cols-2"
          } gap-6`}
          staggerDelay={0.15}
        >
          {blogs.map((blog) => (
            <Fade key={blog.id}>
              <Card className="overflow-hidden flex flex-col h-full hover-scale transition-transform duration-200 hover:shadow-lg">
                <div
                  className={`relative w-full overflow-hidden ${
                    viewMode === "card-large" ? "h-80" : "h-56"
                  }`}
                >
                  <Image
                    src={blog.thumbnailUrl || "/Dummy-Thumbnail.png"}
                    alt={blog.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{blog.name}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="mr-1 h-4 w-4" />
                    {blog.modifiedTime
                      ? `Last modified: ${
                          new Date(blog.modifiedTime)
                            .toISOString()
                            .split("T")[0]
                        }`
                      : ""}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{blog.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full group">
                    <Link href={`/blogs/${blog.id}`}>
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
