// app/blogs/[id]/page.tsx (Assuming App Router)
// If using Pages Router: pages/blogs/[id].tsx

"use client"; // This is a Client Component

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL ||
          (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000");

        const res = await fetch(`${baseUrl}/api/blogs/${fileId}`);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{blogTitle}</h1>
          {blogDate && (
            <p className="text-muted-foreground">
              {new Date(blogDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </header>

        <div
          className={cn(
            "prose dark:prose-invert max-w-none",
            "prose-headings:font-semibold",
            "prose-h1:text-3xl sm:prose-h1:text-4xl",
            "prose-h2:text-2xl sm:prose-h2:text-3xl",
            "prose-h3:text-xl sm:prose-h3:text-2xl",
            "prose-p:text-base sm:prose-p:text-lg",
            "prose-a:text-primary hover:prose-a:underline",
            "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
            "prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg",
            "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic",
            "prose-img:rounded-lg prose-img:border prose-img:border-border",
            isDark ? "dark" : ""
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ node, children }) => (
                <CustomTextNode node={node as TextNode}>
                  {children}
                </CustomTextNode>
              ),
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <div className="relative">
                    <pre
                      className={cn(
                        "p-4 rounded-lg overflow-x-auto",
                        "bg-muted border border-border",
                        "text-sm sm:text-base",
                        "dark:bg-muted/50"
                      )}
                    >
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code
                    className={cn(
                      "px-1.5 py-0.5 rounded",
                      "bg-muted text-foreground",
                      "text-sm",
                      className
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              table: ({ ...props }) => (
                <div className="overflow-x-auto my-6">
                  <table className="min-w-full border-collapse" {...props} />
                </div>
              ),
              th: ({ ...props }) => (
                <th
                  className={cn(
                    "border border-border px-4 py-2 text-left",
                    "bg-muted/50",
                    "dark:bg-muted/30"
                  )}
                  {...props}
                />
              ),
              td: ({ ...props }) => (
                <td className="border border-border px-4 py-2" {...props} />
              ),
            }}
          >
            {blogData.content}
          </ReactMarkdown>
        </div>
      </article>
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
