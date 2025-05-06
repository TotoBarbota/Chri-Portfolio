// app/api/blogs/[id]/route.ts (Assuming App Router)
// If using Pages Router: pages/api/blogs/[id].ts (adjust imports and export default handler)

import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";
import matter from "gray-matter";
import { Buffer } from "buffer";

// Define the expected structure for the blog content response
interface BlogContentResponse {
  content: string; // The Markdown content after frontmatter
  frontmatter?: Record<string, unknown>; // The parsed frontmatter data
  message?: string; // For error messages
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // Get the ID from the URL parameters
  const fileId = params.id;
  
  // Fallback to search params if params.id is not available
  const searchParams = request.nextUrl.searchParams;
  const idFromParams = searchParams.get('id');
  const finalId = fileId || idFromParams;

  if (!finalId) {
    return NextResponse.json(
      { message: "Blog post ID is required" },
      { status: 400 }
    );
  }

  try {
    const drive = await getDriveService();

    // Fetch the file content using alt: 'media'
    const response = await drive.files.get({
      fileId: finalId,
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
    const isApiError = (
      e: unknown
    ): e is { response: { status: number; data: { message?: string } } } =>
      typeof e === "object" &&
      e !== null &&
      "response" in e &&
      typeof e.response === "object" &&
      e.response !== null &&
      "status" in e.response &&
      "data" in e.response;

    const hasErrors = (
      e: unknown
    ): e is { errors: Array<{ reason: string }> } =>
      typeof e === "object" &&
      e !== null &&
      "errors" in e &&
      Array.isArray(e.errors) &&
      e.errors.length > 0 &&
      "reason" in e.errors[0];

    if (isApiError(error)) {
      const status = error.response.status;
      let message = "Failed to fetch blog file.";

      if (status === 404) {
        message = "Blog file not found.";
      } else if (status === 403) {
        message = "Access denied by Google Drive.";
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }

      return NextResponse.json({ message }, { status });
    } else if (hasErrors(error) && error.errors[0].reason === "forbidden") {
      return NextResponse.json(
        { message: "Access denied by Google Drive." },
        { status: 403 }
      );
    } else {
      console.error(`Error fetching blog file ${finalId}:`, error);
      return NextResponse.json(
        { message: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}
