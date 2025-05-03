// app/blogs/[id]/page.tsx (Assuming App Router)
// If using Pages Router: pages/blogs/[id].tsx

"use client"; // This is a Client Component

import { useParams } from "next/navigation"; // Use useParams for App Router
import { useEffect, useState, FC, JSX } from "react";
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
    [key: string]: any; // Allow other frontmatter fields
  };
  message?: string;
}

// *** Define a base URL for your blog images ***
// This could be a path in your public folder, or a URL to a public Google Drive folder
// Example using a public folder:
const BLOG_IMAGES_BASE_URL = "/blog-images/"; // Assuming images are in public/blog-images/

// Example using a public Google Drive folder (more complex, requires knowing file IDs or using names)
// For Google Drive, you'd likely need another API call to map names to IDs or use the thumbnail folder approach
// If using a public Google Drive folder and matching by name, you'd need a map similar to the thumbnail logic
// For simplicity, we'll demonstrate with a base URL assumption.
// If your images are also in the SAME thumbnail folder, you could reuse that logic here.

// *** Custom component to render text nodes and handle [[image.png]] syntax ***
const CustomTextNode: React.FC<{ node: any; children: React.ReactNode }> = ({
  node,
  children,
}) => {
  // Check if the node is a text node and has a string value
  if (node.type === "text" && typeof node.value === "string") {
    const text = node.value;
    // Regular expression to find [[...]] patterns
    const imagePattern = /\[\[([^\]]+)\]\]/g; // Finds [[any_characters_except_closing_bracket]]

    // If the text contains the pattern, split it and render parts
    if (imagePattern.test(text)) {
      const parts = text.split(imagePattern);
      const elements: (string | JSX.Element)[] = [];

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i % 2 === 1) {
          // This part is the content inside [[ ]]
          const imageName = part.trim(); // Get the filename, trim whitespace
          // Construct the full image URL
          // This assumes your images are accessible at BLOG_IMAGES_BASE_URL + imageName
          const imageUrl = `${BLOG_IMAGES_BASE_URL}${imageName}`;

          // Render as Next.js Image component
          elements.push(
            <Image
              key={imageName} // Use image name as key
              src={imageUrl}
              alt={imageName.replace(/\.[^/.]+$/, "")} // Use filename without extension as alt text
              width={600} // Set a default width (adjust as needed)
              height={400} // Set a default height (adjust as needed, or use layout="responsive")
              layout="intrinsic" // Or "responsive"
              objectFit="contain" // Or "cover"
              className="my-4 rounded-md shadow-sm" // Add some styling
            />
          );
        } else {
          // This part is regular text
          elements.push(part);
        }
      }
      return <>{elements}</>; // Return the array of elements
    }
  }
  // If no pattern found or not a text node, render the original children
  return <>{children}</>;
};

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
  const [blogThumbnail, setBlogThumbnail] = useState<string | null>(null);

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

          // *** Check for thumbnail in frontmatter ***
          if (
            data.frontmatter.thumbnail &&
            typeof data.frontmatter.thumbnail === "string"
          ) {
            setBlogThumbnail(data.frontmatter.thumbnail);
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

      {blogThumbnail && (
        <div className="mb-6">
          <Image
            src={blogThumbnail}
            alt={blogTitle}
            width={600}
            height={400}
            className="rounded-lg"
          />
        </div>
      )}

      <div className="blog-content prose prose-invert lg:prose-xl max-w-none dark:prose-invert">
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
