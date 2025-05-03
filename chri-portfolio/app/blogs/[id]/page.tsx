// app/blogs/page.tsx (Assuming App Router)
// If using Pages Router: pages/blogs.tsx

"use client"; // Client Component

import { useEffect, useState, FC } from "react";
import Link from "next/link";

// Define the type for the data fetched from the list API
// ADDED description
interface BlogListItem {
  id: string;
  name: string;
  modifiedTime?: string;
  description?: string; // Include description
}

const BlogsPage: FC = () => {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
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
        const data: BlogListItem[] = await res.json();
        setBlogs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  if (loading) return <div>Loading blogs...</div>;
  if (error) return <div>Error: {error}</div>;
  if (blogs.length === 0) return <div>No blog posts found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Blog Posts</h1>

      <ul className="space-y-6">
        {" "}
        {/* Increased spacing */}
        {blogs.map((blog) => (
          <li key={blog.id} className="border-b pb-6">
            {" "}
            {/* Add border for separation */}
            <Link
              href={`/blogs/${blog.id}`}
              className="text-xl font-semibold text-blue-600 hover:underline"
            >
              {/* Display blog name (which is the file name) */}
              {blog.name.replace(/\.md$/, "")}{" "}
              {/* Remove .md extension from display */}
            </Link>
            {/* Display Description if available */}
            {blog.description && (
              <p className="text-gray-700 mt-2 text-sm">{blog.description}</p>
            )}
            {/* Optional: Display modified time if available */}
            {blog.modifiedTime && (
              <p className="text-gray-500 text-xs mt-2">
                Published: {new Date(blog.modifiedTime).toLocaleDateString()}{" "}
                {/* Format date */}
              </p>
            )}
            {/* Note: Tags and Thumbnails are displayed on the blog detail page */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogsPage;
