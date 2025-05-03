// app/blogs/page.tsx (Assuming App Router)
// If using Pages Router: pages/blogs.tsx

"use client"; // Client Component

import { useEffect, useState, FC } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image component for optimized images

// Define the type for the data fetched from the list API
// ADDED description and thumbnailUrl
interface BlogListItem {
  id: string;
  name: string;
  modifiedTime?: string;
  description?: string;
  thumbnailUrl?: string; // Include thumbnailUrl
  // Removed: tags?: string[]; // Tags are not fetched here
  // Removed: error?: string; // No content fetch errors here
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
        console.log(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []); // Empty dependency array means this runs once on mount

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
          <li key={blog.id} className="border-b pb-6 flex items-start gap-6">
            {" "}
            {/* Use flex for layout */}
            {/* Display Thumbnail if available from the thumbnail folder */}
            {blog.thumbnailUrl ? (
              <div className="w-32 h-auto flex-shrink-0">
                {" "}
                {/* Fixed width container for thumbnail */}
                {/* Use Next.js Image component for optimization */}
                {/* Note: Ensure the domain of the thumbnailUrl is allowed in next.config.js */}
                <Image
                  src={blog.thumbnailUrl}
                  alt={`Thumbnail for ${blog.name}`}
                  width={128} // Set appropriate width
                  height={96} // Set appropriate height (adjust as needed)
                  layout="intrinsic" // Or "responsive" if you want it to fill container
                  objectFit="cover" // Cover the area, potentially cropping
                  className="rounded-md shadow-sm" // Basic styling
                />
              </div>
            ) : (
              // Optional: Placeholder if no matching thumbnail found in the folder
              <div className="w-32 h-24 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-sm text-gray-500 text-center p-2">
                No Thumbnail Available
              </div>
            )}
            <div className="flex-grow">
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

              {/* Removed: Display Tags if available (tags are not fetched here) */}

              {/* Optional: Display modified time if available */}
              {blog.modifiedTime && (
                <p className="text-gray-500 text-xs mt-2">
                  Published: {new Date(blog.modifiedTime).toLocaleDateString()}{" "}
                  {/* Format date */}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogsPage;
