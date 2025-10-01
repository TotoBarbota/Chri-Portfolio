import { Suspense } from "react";
import { BlogsList } from "@/components/blogs-list";
import { ContentLoadingSkeleton } from "@/components/content-loading-skeleton";
import { Fade } from "@/components/motion";
import { listBlogs } from "@/lib/local-files";

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
    const blogs = await listBlogs();

    return blogs.map((blog) => ({
      id: blog.id,
      name: blog.name.replace(/\.md$/, ""),
      title: blog.name,
      modifiedTime: blog.modifiedTime,
      description: blog.description,
      thumbnailUrl: blog.thumbnailPath,
    }));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
}

async function BlogsContent() {
  const blogs = await getBlogs();
  if (blogs.length === 0)
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold tracking-tight text-muted-foreground sm:text-xl md:text-2xl">
          Coming Soon!
        </h2>
      </div>
    );
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
