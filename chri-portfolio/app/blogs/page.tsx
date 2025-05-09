import { Suspense } from "react";
import { BlogsList } from "@/components/blogs-list";
import { ContentLoadingSkeleton } from "@/components/content-loading-skeleton";
import { Fade } from "@/components/motion";

interface BlogListItem {
  id: string;
  name: string;
  modifiedTime?: string;
  description?: string;
  thumbnailUrl?: string;
  readTime?: string;
}

async function getBlogs(): Promise<BlogListItem[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/blogs`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const errorMessage =
        errorData?.message || `Error fetching blogs: ${res.status}`;
      throw new Error(errorMessage);
    }

    const data = await res.json();
    return data.map((post: BlogListItem) => ({
      ...post,
      name: post.name.replace(/\.md$/, ""),
      title: post.name,
    }));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
}

async function BlogsContent() {
  const blogs = await getBlogs();
  if (blogs.length === 0) return <div>No blog posts found.</div>;
  return <BlogsList blogs={blogs} />;
}

export default function Page() {
  return (
    <div>
      {/* Non-suspended content */}
      <div className="py-12">
        <Fade direction="up" className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            My Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Thoughts, insights, and updates on various topics I&apos;m
            passionate about.
          </p>
        </Fade>

        {/* Suspended content */}
        <Suspense fallback={<ContentLoadingSkeleton viewMode="card-small" />}>
          <BlogsContent />
        </Suspense>
      </div>
    </div>
  );
}
