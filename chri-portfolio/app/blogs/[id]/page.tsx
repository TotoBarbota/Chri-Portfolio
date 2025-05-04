// app/blogs/[id]/page.tsx (Assuming App Router)
// If using Pages Router: pages/blogs/[id].tsx

"use client"; // This is a Client Component

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Optional: Add support for GitHub Flavored Markdown (tables, task lists etc.)
import rehypeRaw from "rehype-raw"; // Optional: Allow raw HTML within Markdown (use with caution)
import Image from "next/image";

// Define the type for the data fetched from the detail API
interface BlogContentData {
  content: string;
  frontmatter?: {
    title?: string;
    date?: string; // Or Date type if you parse it
    tags?: string[];
    thumbnail?: string; // Added thumbnail field in frontmatter
    [key: string]: unknown; // Allow other frontmatter fields
  };
  message?: string;
}

// *** Define a base URL for your blog images ***
// This could be a path in your public folder, or a URL to a public Google Drive folder
// Example using a public folder:
const BLOG_IMAGES_BASE_URL = "/blog-images/"; // Assuming images are in public/blog-images/

// *** Custom component to render text nodes and handle [[image.png]] syntax ***
interface TextNode {
  type: string;
  value?: string;
  children?: TextNode[];
}

const CustomTextNode: React.FC<{
  node: TextNode;
  children: React.ReactNode;
}> = ({ node, children }) => {
  // Check if the node is a text node and has a string value
  if (node.type === "text" && typeof node.value === "string") {
    const text = node.value;
    // Regular expression to find [[...]] patterns
    const imagePattern = /\[\[(.*?)\]\]/g;
    const parts = text.split(imagePattern);

    return (
      <>
        {parts.map((part, index) => {
          if (index % 2 === 0) {
            // Even index: regular text
            return <span key={index}>{part}</span>;
          }
          // Odd index: image reference
          const imagePath = part.trim();
          const imageUrl = `${BLOG_IMAGES_BASE_URL}${imagePath}`;
          return (
            <Image
              key={index}
              src={imageUrl}
              alt={`Image: ${imagePath}`}
              width={800}
              height={400}
              className="my-4 rounded-lg"
              priority={index === 0} // Only prioritize the first image
            />
          );
        })}
      </>
    );
  }
  return <>{children}</>;
};

const BlogDetailPage = () => {
  const params = useParams();
  const id = params.id as string | string[];
  const fileId = Array.isArray(id) ? id[0] : id;

  const [blogData, setBlogData] = useState<BlogContentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for blog metadata
  const [blogTitle, setBlogTitle] = useState<string>("Loading Blog Post...");
  const [blogDate, setBlogDate] = useState<string | null>(null);

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
        const data = await res.json();
        if (!data || typeof data !== "object") {
          throw new Error("Invalid response format: expected object");
        }

        const frontmatter = data.frontmatter as BlogContentData["frontmatter"];
        if (!frontmatter) {
          throw new Error("Missing frontmatter data");
        }

        setBlogData(data as BlogContentData);
        setBlogTitle(frontmatter.title || "Untitled Blog Post");
        setBlogDate(
          frontmatter.date
            ? new Date(frontmatter.date).toLocaleDateString()
            : null
        );
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error fetching blog content:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogContent();
  }, [fileId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!blogData) return <div>No blog data found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{blogTitle}</h1>
      {blogDate && <p className="text-muted-foreground mb-4">{blogDate}</p>}
      <div className="prose max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ node, children }) => (
              <CustomTextNode node={node as TextNode}>
                {children}
              </CustomTextNode>
            ),
          }}
        >
          {blogData.content}
        </ReactMarkdown>
      </div>
    </div>
  );
  {
    /* Optional: Add custom CSS for the blog content if not using Tailwind Prose */
  }
  {
    /*
       <style jsx global>{`
         .blog-content h1, .blog-content h2, .blog-content h3 { margin-top: 1em; }
         .blog-content p { margin-bottom: 1em; line-height: 1.6; }
         .blog-content pre { background-color: #f4f4f4; padding: 10px; overflow-x: auto; border-radius: 5px; }
         .blog-content code { font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; }
         .blog-content img { max-width: 100%; height: auto; }
         /* Add more styling for lists, blockquotes, etc. `}
       </style>
       */
  }
};

export default BlogDetailPage;
