// app/api/blogs/route.ts (Assuming App Router)
// If using Pages Router: pages/api/blogs.ts (adjust imports and export default handler)

import { NextRequest, NextResponse } from "next/server";
import { getDriveService, DriveFile } from "@/lib/google-drive"; // Adjust path as needed

// Define the expected structure for the blog list response
type BlogListItem = Pick<
  DriveFile,
  "id" | "name" | "modifiedTime" | "description"
> & {
  thumbnailUrl?: string; // Add thumbnailUrl field
};

export async function GET(request: NextRequest) {
  try {
    const drive = await getDriveService();
    const blogsFolderId = process.env.BLOGS_FOLDER_ID;
    const thumbnailFolderId = process.env.THUMBNAILS_FOLDER_ID; // Get thumbnail folder ID

    console.log("DEBUG: Blogs Folder ID:", blogsFolderId); // Log the blog folder ID
    console.log("DEBUG: Thumbnail Folder ID:", thumbnailFolderId); // Log the thumbnail folder ID

    if (!blogsFolderId) {
      return NextResponse.json(
        { message: "Blogs folder ID not configured." },
        { status: 500 }
      );
    }
    if (!thumbnailFolderId) {
      return NextResponse.json(
        { message: "Thumbnail folder ID not configured." },
        { status: 500 }
      );
    }

    // --- STEP 1: List files in the Blogs folder (metadata) ---
    console.log(`DEBUG: Listing files in blogs folder ${blogsFolderId}...`); // Log before listing
    const blogsListResponse = await drive.files.list({
      q: `'${blogsFolderId}' in parents and (mimeType='text/markdown' or mimeType='text/plain')`,
      fields: "files(id, name, mimeType, modifiedTime, description)", // Request metadata
      orderBy: "modifiedTime desc", // Optional: Order by modification time descending
      pageSize: 1000, // Increase page size if you have many blogs/thumbnails
    });

    const blogFilesMetadata =
      (blogsListResponse.data.files as DriveFile[] | undefined) || [];
    console.log(
      "DEBUG: Raw Blog Files Metadata from Drive:",
      blogFilesMetadata
    ); // Log raw results

    // Filter for .md extension if mimeType is text/plain
    const mdBlogFiles = blogFilesMetadata.filter(
      (file) =>
        file.mimeType === "text/markdown" ||
        (file.mimeType === "text/plain" && file.name.endsWith(".md"))
    );
    console.log("DEBUG: Filtered Markdown Blog Files:", mdBlogFiles); // Log after filtering

    // --- STEP 2: List files in the Thumbnails folder (metadata) ---
    console.log(
      `DEBUG: Listing files in thumbnail folder ${thumbnailFolderId}...`
    ); // Log before listing
    const thumbnailsListResponse = await drive.files.list({
      q: `'${thumbnailFolderId}' in parents`, // List all files in the thumbnail folder
      fields: "files(id, name)", // Request id and name (we'll construct the URL)
      pageSize: 1000, // Increase page size if you have many thumbnails
    });

    const thumbnailFiles =
      (thumbnailsListResponse.data.files as DriveFile[] | undefined) || [];
    console.log(
      "DEBUG: Raw Thumbnail Files Metadata from Drive:",
      thumbnailFiles
    ); // Log raw results

    // --- STEP 3: Create a map of thumbnail files by name for easy lookup ---
    // Map: thumbnail_name_without_ext -> direct_image_url
    const thumbnailMap = new Map<string, string>();
    thumbnailFiles.forEach((thumbFile) => {
      const nameWithoutExt = thumbFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
      // *** CHANGE: Construct the direct view URL using the file ID ***
      const directImageUrl = `https://drive.google.com/uc?export=view&id=${thumbFile.id}`;
      thumbnailMap.set(nameWithoutExt, directImageUrl);
    });
    console.log("DEBUG: Thumbnail Map:", thumbnailMap); // Log the thumbnail map

    // --- STEP 4: Combine blog data with matching thumbnail URLs ---
    const blogListItems: BlogListItem[] = mdBlogFiles.map((blogFile) => {
      const blogNameWithoutExt = blogFile.name.replace(/\.md$/, ""); // Remove .md extension

      // Find matching thumbnail by name
      const thumbnailUrl = thumbnailMap.get(blogNameWithoutExt);

      return {
        id: blogFile.id,
        name: blogFile.name, // Keep full name for linking/display
        modifiedTime: blogFile.modifiedTime,
        description: blogFile.description,
        thumbnailUrl: thumbnailUrl, // Add the found thumbnail URL (or undefined)
      };
    });

    console.log("DEBUG: Final Blog List Items:", blogListItems); // Log the final result

    return NextResponse.json(blogListItems);
  } catch (error: any) {
    console.error("Error listing blogs with thumbnails:", error);
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
