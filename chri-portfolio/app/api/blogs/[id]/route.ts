// app/api/blogs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBlogFile } from "@/lib/local-files";
import matter from "gray-matter";

// Define the expected structure for the blog content response
interface BlogContentResponse {
  content: string; // The Markdown content after frontmatter
  frontmatter?: Record<string, unknown>; // The parsed frontmatter data
  message?: string; // For error messages
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const fileId = id;

  console.log(`[API Blog] Received blog ID: "${fileId}"`);

  if (!fileId) {
    return NextResponse.json(
      { message: "Blog post ID is required" },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  try {
    const markdownContent = await getBlogFile(fileId);

    if (!markdownContent) {
      return NextResponse.json(
        { message: "Blog post not found" },
        { status: 404 }
      );
    }

    // Use gray-matter to parse frontmatter and content
    const { data: frontmatter, content } = matter(markdownContent);

    // Return the parsed content and frontmatter with CORS headers
    return NextResponse.json(
      {
        content: content,
        frontmatter: frontmatter,
      } as BlogContentResponse,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: unknown) {
    console.error(`Error fetching blog file ${fileId}:`, error);
    return NextResponse.json(
      { message: "Failed to fetch blog content" },
      { status: 500 }
    );
  }
}
