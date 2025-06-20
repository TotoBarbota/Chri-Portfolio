// app/api/projects/route.ts (Assuming App Router)
// If using Pages Router: pages/api/projects.ts (adjust imports and export default handler)

import { NextResponse } from "next/server";
import { getDriveService, DriveFile } from "@/lib/google-drive"; // Adjust path as needed

// Define the expected structure for the project list response
// ADDED description and thumbnailUrl (fetched from thumbnail folder)
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

type ProjectListItem = Pick<
  DriveFile,
  "id" | "modifiedTime" | "description"
> & {
  name: string; // Keep name as string, but it will be stripped of extension
  thumbnailUrl?: string; // Add thumbnailUrl field
};

export async function GET() {
  try {
    const drive = await getDriveService();
    const projectsFolderId = process.env.PROJECTS_FOLDER_ID;
    const projectsThumbnailFolderId = process.env.THUMBNAILS_FOLDER_ID; // Get projects thumbnail folder ID

    if (!projectsFolderId) {
      return NextResponse.json(
        { message: "Projects folder ID not configured." },
        { status: 500 }
      );
    }
    if (!projectsThumbnailFolderId) {
      return NextResponse.json(
        { message: "Projects Thumbnail folder ID not configured." },
        { status: 500 }
      );
    }

    // --- STEP 1: List files in the Projects folder (metadata) ---
    const projectsListResponse = await drive.files.list({
      q: `'${projectsFolderId}' in parents and mimeType='application/pdf'`, // Filter by PDF mimeType
      // FIX: Added mimeType back to the fields requested
      fields: "files(id, name, mimeType, modifiedTime, description)", // Request mimeType, modifiedTime, description
      orderBy: "modifiedTime desc", // Optional: Order by modification time descending
      pageSize: 1000, // Increase page size if you have many projects/thumbnails
    });

    const projectFilesMetadata =
      (projectsListResponse.data.files as DriveFile[] | undefined) || [];

    // Filter for PDFs (this filter should now work correctly as mimeType is available)
    const pdfProjectFiles = projectFilesMetadata.filter(
      (file) => file.mimeType === "application/pdf"
    );

    // --- STEP 2: List files in the Projects Thumbnails folder (metadata) ---
    const thumbnailsListResponse = await drive.files.list({
      q: `'${projectsThumbnailFolderId}' in parents`, // List all files in the projects thumbnail folder
      fields: "files(id, name)", // Request id and name (we'll construct the URL)
      pageSize: 1000, // Increase page size if you have many thumbnails
    });

    const thumbnailFiles =
      (thumbnailsListResponse.data.files as DriveFile[] | undefined) || [];

    // --- STEP 3: Create a map of thumbnail files by name for easy lookup ---
    // Map: thumbnail_name_without_ext -> direct_image_url
    const thumbnailMap = new Map<string, string>();
    thumbnailFiles.forEach((thumbFile) => {
      const nameWithoutExt = thumbFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
      // *** CHANGE: Construct the direct view URL using the file ID ***
      const directImageUrl = `https://drive.google.com/uc?export=view&id=${thumbFile.id}`;
      thumbnailMap.set(nameWithoutExt, directImageUrl);
    });

    // --- STEP 4: Combine project data with matching thumbnail URLs ---
    const projectListItems: ProjectListItem[] = pdfProjectFiles.map(
      (projectFile) => {
        const projectNameWithoutExt = projectFile.name.replace(/\.pdf$/, ""); // Remove .pdf extension for thumbnail matching

        // Find matching thumbnail by name
        const thumbnailUrl = thumbnailMap.get(projectNameWithoutExt);

        return {
          id: projectFile.id,
          // FIX: Strip .pdf extension from the name returned in the API response
          name: projectFile.name.replace(/\.pdf$/, ""),
          modifiedTime: projectFile.modifiedTime,
          description: projectFile.description,
          thumbnailUrl: thumbnailUrl, // Add the found thumbnail URL (or undefined)
        };
      }
    );

    return NextResponse.json(projectListItems);
  } catch (error: unknown) {
    console.error("Error listing projects with thumbnails:", error);
    let status = 500;
    let message = "Failed to list project files.";

    const apiError = error as GoogleApiError;

    if (apiError.response?.status) {
      status = apiError.response.status;
      if (status === 403) message = "Access denied by Google Drive.";
    } else if (apiError.errors?.[0]?.reason === "forbidden") {
      status = 403;
      message = "Access denied by Google Drive.";
    }

    return NextResponse.json({ message }, { status });
  }
}
