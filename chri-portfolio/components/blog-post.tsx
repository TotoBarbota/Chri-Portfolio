import { BlogPost } from "@/lib/types";
import { parseMarkdown } from "@/lib/markdown-parser";
import { ContentView } from "./content-viewer";

interface BlogPostProps {
  post: BlogPost;
}

export const BlogPostCard = ({ post }: BlogPostProps) => {
  return (
    <article className="rounded-lg border p-6 hover:bg-muted/50 transition-colors">
      <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
      <div className="text-sm text-muted-foreground mb-4">
        <span className="mr-4">{new Date(post.date).toLocaleDateString()}</span>
        <span>
          Last modified: {new Date(post.lastModified).toLocaleDateString()}
        </span>
      </div>
      <ContentView id={post.id} type="markdown" />
    </article>
  );
};
