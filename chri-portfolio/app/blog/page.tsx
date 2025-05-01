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
import { ArrowRight, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fade, FadeGroup } from "@/components/motion";
import { ViewToggle, type ViewMode } from "@/components/view-toggle";

// Replace the blogPosts array with this business-oriented version
const blogPosts = [
  {
    id: 1,
    title: "5 Leadership Principles That Transformed My Business",
    excerpt:
      "Discover the key leadership strategies that helped me navigate challenges and drive sustainable growth.",
    date: "May 15, 2023",
    image: "/placeholder.svg?height=250&width=500",
    tags: ["Leadership", "Business Growth", "Management"],
    slug: "leadership-principles",
  },
  {
    id: 2,
    title: "Building a Customer-Centric Organization",
    excerpt:
      "How focusing on customer experience created loyal advocates and boosted our bottom line.",
    date: "June 22, 2023",
    image: "/placeholder.svg?height=250&width=500",
    tags: ["Customer Experience", "Strategy", "Business"],
    slug: "customer-centric-organization",
  },
  {
    id: 3,
    title: "Navigating Market Disruption: A Case Study",
    excerpt:
      "Lessons learned from pivoting our business model during a period of significant market change.",
    date: "July 10, 2023",
    image: "/placeholder.svg?height=250&width=500",
    tags: ["Innovation", "Strategy", "Case Study"],
    slug: "navigating-market-disruption",
  },
  {
    id: 4,
    title: "5 Leadership Principles That Transformed My Business",
    excerpt:
      "Discover the key leadership strategies that helped me navigate challenges and drive sustainable growth.",
    date: "May 15, 2023",
    image: "/placeholder.svg?height=250&width=500",
    tags: ["Leadership", "Business Growth", "Management"],
    slug: "leadership-principles",
  },
  {
    id: 5,
    title: "Building a Customer-Centric Organization",
    excerpt:
      "How focusing on customer experience created loyal advocates and boosted our bottom line.",
    date: "June 22, 2023",
    image: "/placeholder.svg?height=250&width=500",
    tags: ["Customer Experience", "Strategy", "Business"],
    slug: "customer-centric-organization",
  },
  {
    id: 6,
    title: "Navigating Market Disruption: A Case Study",
    excerpt:
      "Lessons learned from pivoting our business model during a period of significant market change.",
    date: "July 10, 2023",
    image: "/placeholder.svg?height=250&width=500",
    tags: ["Innovation", "Strategy", "Case Study"],
    slug: "navigating-market-disruption",
  },
];

export default function BlogPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("card-small");

  return (
    <div className="py-12">
      {/* Update the heading and description */}
      <Fade direction="up" className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Insights
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Thoughts and perspectives on business strategy, leadership, and
          innovation.
        </p>
      </Fade>

      <div className="flex justify-end mb-6">
        <ViewToggle
          onChange={setViewMode}
          defaultValue="card-small"
          storageKey="blog-view-mode"
        />
      </div>

      {viewMode === "list" ? (
        <FadeGroup className="space-y-6" staggerDelay={0.15}>
          {blogPosts.map((post) => (
            <Fade key={post.id}>
              <div className="flex flex-col md:flex-row gap-6 border rounded-lg p-4 hover:shadow-md transition-all hover:border-primary/50">
                <div className="md:w-1/3 h-48 relative rounded-md overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="md:w-2/3 flex flex-col">
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="mr-1 h-4 w-4" />
                    {post.date}
                  </div>
                  <h2 className="text-2xl font-bold">{post.title}</h2>
                  <p className="text-muted-foreground mt-2 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="transition-all hover:bg-primary/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <Button asChild className="group">
                      <Link href={`/blog/${post.slug}`}>
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
          className={`grid gap-8 ${
            viewMode === "card-small"
              ? "md:grid-cols-2 lg:grid-cols-3"
              : "md:grid-cols-1 lg:grid-cols-2"
          }`}
          staggerDelay={0.15}
        >
          {blogPosts.map((post) => (
            <Fade key={post.id}>
              <Card className="overflow-hidden flex flex-col hover-scale">
                <div
                  className={`relative w-full overflow-hidden ${
                    viewMode === "card-large" ? "h-64" : "h-48"
                  }`}
                >
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="mr-1 h-4 w-4" />
                    {post.date}
                  </div>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
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
                <CardFooter>
                  <Button asChild className="w-full group">
                    <Link href={`/blog/${post.slug}`}>
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
    </div>
  );
}
