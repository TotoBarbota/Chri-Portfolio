// app/blogs/[id]/page.tsx (Assuming App Router)
// If using Pages Router: pages/blogs/[id].tsx

"use client"; // This is a Client Component

import { useParams } from "next/navigation"; // Use useParams for App Router
import { useEffect, useState, FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Optional: Add support for GitHub Flavored Markdown (tables, task lists etc.)
import rehypeRaw from "rehype-raw"; // Optional: Allow raw HTML within Markdown (use with caution)

// Define the type for the data fetched from the detail API
interface BlogContentData {
  content: string;
  frontmatter?: any; // Adjust type if you know your frontmatter structure
}

const BlogDetailPage: FC = () => {
  // Use useParams() hook from next/navigation
  const params = useParams();
  const id = params.id;
  const fileId = Array.isArray(id) ? id[0] : id;

  const [blogData, setBlogData] = useState<BlogContentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for blog title, potentially from frontmatter
  const [blogTitle, setBlogTitle] = useState<string>("Loading Blog Post...");
  const [blogDate, setBlogDate] = useState<string | null>(null); // State for date
  const [blogTags, setBlogTags] = useState<string[]>([]); // State for tags

  useEffect(() => {
    if (!fileId) {
      setLoading(false);
      setError("Blog ID not provided.");
      return;
    }

    async function fetchBlogContent() {
      try {
        const res = await fetch(`/api/blogs/${fileId}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          const errorMessage =
            errorData?.message || `Error fetching blog content: ${res.status}`;
          throw new Error(errorMessage);
        }
        const data: BlogContentData = await res.json(); // Type the fetched data

        setBlogData(data); // Store both content and frontmatter

        // *** Use frontmatter for title, date, tags etc. ***
        if (data.frontmatter) {
          if (
            data.frontmatter.title &&
            typeof data.frontmatter.title === "string"
          ) {
            setBlogTitle(data.frontmatter.title);
          } else if (typeof id === "string") {
            // Fallback to filename if no title in frontmatter (remove .md)
            setBlogTitle(id.replace(/\.md$/, "")); // This uses the file ID, not the name.
            // You'd need to fetch the file name separately if you want to use that as fallback
            // Or modify the list API to return name and pass it via state/query param
          }

          if (data.frontmatter.date) {
            try {
              // Assuming date is in a format Date constructor can parse
              setBlogDate(new Date(data.frontmatter.date).toLocaleDateString());
            } catch (e) {
              console.error("Could not parse blog date from frontmatter:", e);
              setBlogDate(String(data.frontmatter.date)); // Display raw value if parsing fails
            }
          }

          if (Array.isArray(data.frontmatter.tags)) {
            setBlogTags(
              data.frontmatter.tags.filter(
                (tag: any) => typeof tag === "string"
              )
            ); // Ensure tags are strings
          }
        } else if (typeof id === "string") {
          // If no frontmatter, fallback title to filename
          setBlogTitle(id.replace(/\.md$/, "")); // Again, this is file ID. Consider fetching name.
        }
      } catch (err: any) {
        console.error("Error fetching blog post:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogContent();
  }, [fileId]); // Depend on fileId

  if (loading) return <div>Loading blog post...</div>;
  if (error) return <div>Error loading blog post: {error}</div>;
  if (!blogData || !blogData.content) return <div>Blog content not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">{blogTitle}</h1>
      {blogDate && (
        <p className="text-gray-600 text-sm mb-4">Published on {blogDate}</p>
      )}
      {blogTags.length > 0 && (
        <div className="mb-6">
          {blogTags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="blog-content prose lg:prose-xl max-w-none">
        {" "}
        {/* Use Tailwind Typography plugin 'prose' */}
        {/* ReactMarkdown renders the content as HTML */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]} // Add plugins for features like tables
          rehypePlugins={[rehypeRaw]} // Add plugin to render raw HTML
        >
          {blogData.content}
        </ReactMarkdown>
      </div>

      {/* Optional: Add custom CSS for the blog content if not using Tailwind Prose */}
      {/*
       <style jsx global>{`
         .blog-content h1, .blog-content h2, .blog-content h3 { margin-top: 1em; }
         .blog-content p { margin-bottom: 1em; line-height: 1.6; }
         .blog-content pre { background-color: #f4f4f4; padding: 10px; overflow-x: auto; border-radius: 5px; }
         .blog-content code { font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; }
         .blog-content img { max-width: 100%; height: auto; }
         /* Add more styling for lists, blockquotes, etc. `}
       </style>
       */}
    </div>
  );
};

export default BlogDetailPage;
