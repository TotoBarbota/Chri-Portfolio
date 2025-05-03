// app/api/blogs/route.ts (Assuming App Router)
// If using Pages Router: pages/api/blogs.ts (adjust imports and export default handler)

import { NextRequest, NextResponse } from "next/server";
import { getDriveService, DriveFile } from "@/lib/google-drive"; // Adjust path as needed

// Define the expected structure for the blog list response
type BlogListItem = Pick<DriveFile, "id" | "name" | "modifiedTime">; // Only return these fields

export async function GET(request: NextRequest) {
  // No need to check req.method in App Router GET function

  try {
    const drive = await getDriveService();
    const blogsFolderId = process.env.BLOG_FOLDER_ID;

    if (!blogsFolderId) {
      return NextResponse.json(
        { message: "Blogs folder ID not configured." },
        { status: 500 }
      );
    }

    // List files in the blogs folder, filtering by likely Markdown mimeTypes
    // Request id, name, mimeType, and modifiedTime
    const response = await drive.files.list({
      q: `'${blogsFolderId}' in parents and (mimeType='text/markdown' or mimeType='text/plain')`,
      fields: "files(id, name, mimeType, modifiedTime)", // Request modifiedTime
      orderBy: "modifiedTime desc", // Optional: Order by modification time descending
    });

    const files = (response.data.files as DriveFile[] | undefined) || [];

    // Refine filtering for .md extension if mimeType is text/plain
    const mdFiles: BlogListItem[] = files
      .filter(
        (file) =>
          file.mimeType === "text/markdown" ||
          (file.mimeType === "text/plain" && file.name.endsWith(".md"))
      )
      .map((file) => ({
        // Map to the BlogListItem type
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
      }));

    return NextResponse.json(mdFiles);
  } catch (error: any) {
    console.error("Error listing blog files:", error);
    let status = 500;
    let message = "Failed to list blog files.";

    if (error.response?.status) {
      status = error.response.status;
      if (status === 403) message = "Access denied by Google Drive.";
    } else if (
      error.errors &&
      error.errors[0] &&
      error.errors[0].reason === "forbidden"
    ) {
      status = 403;
      message = "Access denied by Google Drive.";
    }

    return NextResponse.json({ message: message }, { status: status });
  }
}
