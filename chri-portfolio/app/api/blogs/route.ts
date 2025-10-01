// app/api/blogs/route.ts
import { NextResponse } from "next/server";
import { listBlogs } from "@/lib/local-files";

// Define the expected structure for the blog list response
type BlogListItem = {
  id: string;
  name: string;
  modifiedTime: string;
  description?: string;
  thumbnailUrl?: string;
};

export async function GET() {
  try {
    const blogs = await listBlogs();

    const blogListItems: BlogListItem[] = blogs.map((blog) => ({
      id: blog.id,
      name: blog.name,
      modifiedTime: blog.modifiedTime,
      description: blog.description,
      thumbnailUrl: blog.thumbnailPath,
    }));

    return NextResponse.json(blogListItems);
  } catch (error: unknown) {
    console.error("Error listing blogs:", error);
    return NextResponse.json(
      { message: "Failed to list blog files." },
      { status: 500 }
    );
  }
}
