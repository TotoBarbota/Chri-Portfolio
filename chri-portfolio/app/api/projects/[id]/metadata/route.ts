import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await context.params;

  const fileId = params.id;

  try {
    if (!fileId) {
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
