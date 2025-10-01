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
// Images are served from files/Blog-Images/ via API endpoint
const BLOG_IMAGES_BASE_URL = "/api/files/blog-images/";

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

// Utility to format date from DD-MM-YYYY to "Month D, YYYY"
function formatBlogDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  // Log the original input string
  // console.log("Original date string:", dateStr);

  // If ISO format, just parse it
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // If DD-MM-YYYY format
  const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = ddmmyyyy.exec(dateStr);
  if (match) {
    // Remove unused variable '_'
    const [day, month, year] = match.slice(1);
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Fallback: return as-is
  return dateStr;
}

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
  const [blogAuthor, setBlogAuthor] = useState<string | null>(null); // Add author state

  useEffect(() => {
    if (!fileId) {
      setLoading(false);
      setError("Blog ID not provided.");
      return;
    }

    async function fetchBlogContent() {
      try {
        let baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL ||
          (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000");

        // Remove trailing slash to avoid double slashes
        baseUrl = baseUrl.replace(/\/$/, "");

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
        if (blogTitle && blogTitle !== "Untitled Blog Post") {
          document.title = blogTitle;
        }
        setBlogDate(frontmatter.date ? formatBlogDate(frontmatter.date) : null);
        setBlogAuthor(frontmatter.author ? String(frontmatter.author) : null); // Set author
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
  }, [fileId, blogTitle]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!blogData) return <div>No blog data found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{blogTitle}</h1>
          {blogAuthor && (
            <p className="text-muted-foreground">By {blogAuthor}</p>
          )}
          {blogDate && (
            <p className="text-muted-foreground">Uploaded on: {blogDate}</p>
          )}
        </header>

        <div
          className={cn(
            // Base prose styling
            "prose dark:prose-invert max-w-none",

            // Headings - hierarchy with proper spacing
            "prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-20",
            "prose-h1:text-4xl sm:prose-h1:text-5xl prose-h1:text-primary prose-h1:mt-8 prose-h1:mb-6 prose-h1:leading-tight",
            "prose-h2:text-3xl sm:prose-h2:text-4xl prose-h2:text-primary prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/50",
            "prose-h3:text-2xl sm:prose-h3:text-3xl prose-h3:text-foreground prose-h3:mt-8 prose-h3:mb-3",
            "prose-h4:text-xl sm:prose-h4:text-2xl prose-h4:text-foreground prose-h4:mt-6 prose-h4:mb-2",
            "prose-h5:text-lg sm:prose-h5:text-xl prose-h5:text-foreground/90 prose-h5:mt-4 prose-h5:mb-2",
            "prose-h6:text-base sm:prose-h6:text-lg prose-h6:text-foreground/80 prose-h6:mt-4 prose-h6:mb-2",

            // Paragraphs and text
            "prose-p:text-base sm:prose-p:text-lg prose-p:leading-relaxed prose-p:my-4 prose-p:text-foreground/90",
            "prose-lead:text-xl prose-lead:text-muted-foreground prose-lead:leading-relaxed",

            // Links - beautiful hover effects
            "prose-a:text-primary prose-a:font-medium prose-a:no-underline prose-a:transition-all prose-a:duration-200",
            "hover:prose-a:text-primary/80 hover:prose-a:underline hover:prose-a:decoration-2 hover:prose-a:underline-offset-4",

            // Strong and emphasis
            "prose-strong:text-foreground prose-strong:font-bold",
            "prose-em:text-foreground/90 prose-em:italic",

            // Lists - proper spacing and styling
            "prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6",
            "prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6",
            "prose-li:my-2 prose-li:text-foreground/90 prose-li:leading-relaxed",
            "prose-li:marker:text-primary/70",

            // Inline code - distinct from code blocks
            "prose-code:bg-muted prose-code:text-accent-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:font-semibold",
            "prose-code:before:content-[''] prose-code:after:content-['']",

            // Code blocks - beautiful syntax highlighting container
            "prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:my-6 prose-pre:p-0 prose-pre:overflow-hidden",
            "prose-pre:shadow-sm dark:prose-pre:shadow-none dark:prose-pre:bg-muted/30",

            // Blockquotes - elegant styling
            "prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-3 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:rounded-r-lg",
            "prose-blockquote:text-foreground/80 prose-blockquote:font-normal",
            "dark:prose-blockquote:bg-muted/20 dark:prose-blockquote:border-primary/40",

            // Images - responsive with proper spacing
            "prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:my-8 prose-img:shadow-md prose-img:w-full prose-img:h-auto",
            "dark:prose-img:border-border/50 dark:prose-img:shadow-none",

            // Horizontal rules
            "prose-hr:border-border prose-hr:my-12",

            // Tables - clean and readable
            "prose-table:my-6 prose-table:w-full prose-table:border-collapse",
            "prose-thead:bg-muted/50 prose-thead:text-left",
            "prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-3 prose-th:font-semibold prose-th:text-foreground",
            "prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3 prose-td:text-foreground/90",
            "prose-tr:transition-colors hover:prose-tr:bg-muted/30",

            isDark ? "dark" : ""
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ src, alt }) => {
                // Handle both absolute and relative image paths
                const srcString = typeof src === "string" ? src : "";
                let imageSrc = srcString;

                // If it's a relative path (doesn't start with http:// or https:// or /)
                if (
                  imageSrc &&
                  !imageSrc.startsWith("http") &&
                  !imageSrc.startsWith("/")
                ) {
                  imageSrc = `${BLOG_IMAGES_BASE_URL}${imageSrc}`;
                } else if (
                  imageSrc &&
                  imageSrc.startsWith("/") &&
                  !imageSrc.startsWith("/api/")
                ) {
                  // If it starts with / but isn't an API path, assume it's a blog image
                  imageSrc = `${BLOG_IMAGES_BASE_URL}${imageSrc.substring(1)}`;
                }

                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt={alt || "Blog image"}
                    className="my-6 rounded-lg border border-border w-full h-auto max-w-full"
                  />
                );
              },
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : null;

                return match ? (
                  // Code block (```)
                  <div className="relative group my-6">
                    {language && (
                      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border rounded-t-lg">
                        <span className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                          {language}
                        </span>
                      </div>
                    )}
                    <pre
                      className={cn(
                        "overflow-x-auto p-4",
                        language ? "rounded-t-none" : "rounded-lg",
                        "bg-muted/50 border border-border",
                        "text-sm leading-relaxed",
                        "dark:bg-muted/30 dark:border-border/50",
                        "[&>code]:bg-transparent [&>code]:p-0 [&>code]:text-foreground"
                      )}
                    >
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  // Inline code (`)
                  <code
                    className={cn(
                      "px-1.5 py-0.5 mx-0.5 rounded",
                      "bg-muted text-accent-foreground border border-border/50",
                      "text-[0.875em] font-mono font-semibold",
                      "whitespace-nowrap",
                      "dark:bg-muted/50 dark:border-border/30",
                      className
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              // Headings with anchor link support
              h1: ({ children, ...props }) => (
                <h1
                  className="text-4xl sm:text-5xl font-bold text-primary mt-8 mb-6 leading-tight scroll-mt-20"
                  {...props}
                >
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2
                  className="text-3xl sm:text-4xl font-bold text-primary mt-12 mb-4 pb-2 border-b border-border/50 scroll-mt-20"
                  {...props}
                >
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3
                  className="text-2xl sm:text-3xl font-bold text-foreground mt-8 mb-3 scroll-mt-20"
                  {...props}
                >
                  {children}
                </h3>
              ),
              h4: ({ children, ...props }) => (
                <h4
                  className="text-xl sm:text-2xl font-bold text-foreground mt-6 mb-2 scroll-mt-20"
                  {...props}
                >
                  {children}
                </h4>
              ),

              // Paragraph
              p: ({ node, children }) => (
                <CustomTextNode node={node as TextNode}>
                  <p className="text-base sm:text-lg leading-relaxed my-4 text-foreground/90">
                    {children}
                  </p>
                </CustomTextNode>
              ),

              // Lists
              ul: ({ children, ...props }) => (
                <ul className="my-6 ml-6 list-disc space-y-2" {...props}>
                  {children}
                </ul>
              ),
              ol: ({ children, ...props }) => (
                <ol className="my-6 ml-6 list-decimal space-y-2" {...props}>
                  {children}
                </ol>
              ),
              li: ({ children, ...props }) => (
                <li
                  className="text-foreground/90 leading-relaxed marker:text-primary/70"
                  {...props}
                >
                  {children}
                </li>
              ),

              // Blockquote
              blockquote: ({ children, ...props }) => (
                <blockquote
                  className={cn(
                    "border-l-4 border-primary/50 bg-muted/30 dark:bg-muted/20",
                    "pl-6 pr-4 py-3 my-6 italic rounded-r-lg",
                    "text-foreground/80 font-normal",
                    "dark:border-primary/40"
                  )}
                  {...props}
                >
                  {children}
                </blockquote>
              ),

              // Horizontal rule
              hr: ({ ...props }) => (
                <hr className="border-border my-12" {...props} />
              ),

              // Strong and emphasis
              strong: ({ children, ...props }) => (
                <strong className="font-bold text-foreground" {...props}>
                  {children}
                </strong>
              ),
              em: ({ children, ...props }) => (
                <em className="italic text-foreground/90" {...props}>
                  {children}
                </em>
              ),

              // Links
              a: ({ href, children, ...props }) => (
                <a
                  href={href}
                  className={cn(
                    "text-primary font-medium no-underline transition-all duration-200",
                    "hover:text-primary/80 hover:underline hover:decoration-2 hover:underline-offset-4"
                  )}
                  {...props}
                >
                  {children}
                </a>
              ),

              // Tables
              table: ({ ...props }) => (
                <div className="overflow-x-auto my-8 rounded-lg border border-border shadow-sm">
                  <table className="min-w-full border-collapse" {...props} />
                </div>
              ),
              thead: ({ ...props }) => (
                <thead className="bg-muted/50" {...props} />
              ),
              tbody: ({ ...props }) => <tbody {...props} />,
              tr: ({ ...props }) => (
                <tr
                  className="transition-colors hover:bg-muted/30"
                  {...props}
                />
              ),
              th: ({ ...props }) => (
                <th
                  className={cn(
                    "border border-border px-4 py-3 text-left",
                    "font-semibold text-foreground",
                    "bg-muted/50 dark:bg-muted/30"
                  )}
                  {...props}
                />
              ),
              td: ({ ...props }) => (
                <td
                  className="border border-border px-4 py-3 text-foreground/90"
                  {...props}
                />
              ),
            }}
          >
            {blogData.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
};

export default BlogDetailPage;
