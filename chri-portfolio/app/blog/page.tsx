// app/blog/page.tsx
"use client";
import { useContent } from "@/lib/use-content";
import { Fade, FadeGroup } from "@/components/motion";
import { ArrowRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DriveFile } from "@/lib/google-drive";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<DriveFile[]>([]); // Type the state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/blogs");
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          const errorMessage =
            errorData?.message || `Error fetching blogs: ${res.status}`;
          throw new Error(errorMessage);
        }
        const data: DriveFile[] = await res.json(); // Type the fetched data
        setBlogs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (!blogs) {
    return <div className="text-center py-8">No blog posts found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FadeGroup className="space-y-6" staggerDelay={0.15}>
          {blogs.map((blog) => (
            <Fade key={blog.id}>
              <div className="flex flex-col md:flex-row gap-6 border rounded-lg p-4 hover:shadow-md transition-all hover:border-primary/50">
                <div className="md:w-1/3 h-48 relative rounded-md overflow-hidden">
                  {/* <Image
                    src={post.image}
                    alt={post.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  /> */}
                </div>
                <div className="md:w-2/3 flex flex-col">
                  <h2 className="text-2xl font-bold">{blog.name}</h2>
                  <p className="text-muted-foreground mt-2 mb-4">
                    A blog post about {blog.name.toLowerCase()}
                  </p>
                  {/* <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="transition-all hover:bg-primary/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div> */}
                  <div className="mt-auto">
                    <Button asChild className="group">
                      <Link href={`/blog/${blog.id}`}>
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
      </div>
    </div>
  );
}
