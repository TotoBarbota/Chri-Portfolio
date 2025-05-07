import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // Get the ID from the URL parameters
  const fileId = params.id;

  // Fallback to search params if params.id is not available
  const searchParams = request.nextUrl.searchParams;
  const idFromParams = searchParams.get("id");
  const finalId = fileId || idFromParams;

  if (!finalId) {
    return NextResponse.json(
      { message: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    // Await the params promise before destructuring
    const { id: fileId } = await params;
    const drive = await getDriveService();

    const response = await drive.files.get({
      fileId,
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
