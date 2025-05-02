// app/blog/[slug]/page.tsx
import { useParams } from "next/navigation";
import { useContent } from "@/lib/use-content";
import { ContentView } from "@/components/content-viewer";

export default function BlogPostPage() {
  const { slug } = useParams();
  const { content, error, loading } = useContent();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  const post = content?.blogPosts?.find((p) => p.id === slug);

  if (!post) {
    return <div className="text-center py-8">Blog post not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.name}</h1>
        <div className="text-sm text-muted-foreground mb-8">
          Last updated: {new Date(post.lastModified).toLocaleDateString()}
        </div>
        <ContentView id={post.id} type="markdown" />
      </div>
    </div>
  );
}
