import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Standard type for dynamic params
): Promise<NextResponse> {
  // Get the ID directly from the dynamic route parameters
  const fileId = params.id;

  // In a dynamic route /[id], the 'id' should always come from params.
  // If params.id is somehow undefined, it indicates a routing issue or mismatch.
  if (!fileId) {
    console.error("Dynamic route parameter 'id' is missing in params.");
    // Return a 400 error as the required parameter is missing from the route
    return NextResponse.json(
      { message: "Project ID is required in the route path" },
      { status: 400 }
    );
  }

  try {
    const drive = await getDriveService();

    const response = await drive.files.get({
      fileId: fileId, // Use the fileId obtained from dynamic params
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
