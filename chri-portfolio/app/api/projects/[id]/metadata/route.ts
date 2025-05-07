import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";

export async function GET(request: NextRequest): Promise<NextResponse> {
  let fileId: string | null = null;

  try {
    // Parse the URL to extract the dynamic segment directly from the pathname
    // Assuming the route is /api/projects/[id]/metadata
    const pathname = request.nextUrl.pathname;
    const segments = pathname.split("/");
    // Find the segment that corresponds to the dynamic [id].
    // This approach can be fragile if the route structure changes.
    // A more robust parsing might be needed for complex routes.
    // In this case, we expect the structure to be /api/projects/ID/metadata
    // So the ID should be the segment before 'metadata'.
    const metadataIndex = segments.indexOf("metadata");
    if (metadataIndex > 0 && segments[metadataIndex - 1]) {
      fileId = segments[metadataIndex - 1];
    }

    if (!fileId) {
      console.error("Could not extract fileId from URL pathname:", pathname);
      return NextResponse.json(
        { message: "Project ID is required in the route path" },
        { status: 400 }
      );
    }

    const drive = await getDriveService();

    const response = await drive.files.get({
      fileId: fileId, // Use the extracted fileId
      fields: "name, modifiedTime, webViewLink",
    });

    // Check if response.data exists before accessing its properties
    if (!response.data) {
      return NextResponse.json(
        { error: "File metadata not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: response.data.name,
      modifiedTime: response.data.modifiedTime,
      webViewLink: response.data.webViewLink,
    });
  } catch (error: unknown) {
    console.error("Error in metadata endpoint:", error);
    // Provide a more generic error message for the client
    return NextResponse.json(
      { error: "Failed to fetch project metadata" },
      { status: 500 }
    );
  }
}
