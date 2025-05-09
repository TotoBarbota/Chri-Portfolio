// app/api/blogs/[id]/route.ts (Assuming App Router)
// If using Pages Router: pages/api/blogs/[id].ts (adjust imports and export default handler)

import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";
import matter from "gray-matter";
import { Buffer } from "buffer";

interface GoogleApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  errors?: Array<{
    reason: string;
  }>;
}

// Define the expected structure for the blog content response
interface BlogContentResponse {
  content: string; // The Markdown content after frontmatter
  frontmatter?: Record<string, unknown>; // The parsed frontmatter data
  message?: string; // For error messages
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const fileId = id;

  if (!fileId) {
    return NextResponse.json(
      { message: "Blog post ID is required" },
      { status: 400 }
    );
  }

  try {
    const drive = await getDriveService();

    // Fetch the file content using alt: 'media'
    const response = await drive.files.get({
      fileId: fileId,
      alt: "media" as const, // Use const assertion for type safety
    });

    // Convert the response to a Buffer
    const markdownBuffer = Buffer.from(response.data as string);
    if (!Buffer.isBuffer(markdownBuffer)) {
      throw new Error("Failed to convert response to Buffer");
    }
    const markdownContentRaw = markdownBuffer.toString("utf8"); // Assuming UTF-8 encoding

    // *** Use gray-matter to parse frontmatter and content ***
    const { data: frontmatter, content } = matter(markdownContentRaw);

    // Return the parsed content and frontmatter
    return NextResponse.json({
      content: content,
      frontmatter: frontmatter,
    } as BlogContentResponse); // Cast to the defined type
  } catch (error: unknown) {
    console.error(`Error fetching blog file ${fileId}:`, error);
    let status = 500;
    let message = "Failed to fetch blog content";

    const apiError = error as GoogleApiError;
    
    if (apiError.response?.status) {
      status = apiError.response.status;
      if (status === 404) message = "Blog post not found";
      else if (status === 403) message = "Access denied by Google Drive";
    } else if (apiError.errors?.[0]?.reason === "forbidden") {
      status = 403;
      message = "Access denied by Google Drive";
    }

    return NextResponse.json({ message }, { status });
  }
}
