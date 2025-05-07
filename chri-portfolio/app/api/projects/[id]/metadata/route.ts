import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";

// Define a specific type for the context object containing dynamic parameters
type RouteContext = {
  params: {
    /** The project ID extracted from the dynamic route segment [id]. */
    id: string;
  };
};

export async function GET(
  request: NextRequest,
  // Use the defined RouteContext type for the second argument
  context: RouteContext
): Promise<NextResponse> {
  // Get the ID directly from the dynamic route parameters provided in the context
  const fileId = context.params.id;

  if (!fileId) {
    console.warn("Dynamic route parameter 'id' is missing.");
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
