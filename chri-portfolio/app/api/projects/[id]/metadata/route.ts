import { NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";

// Define the correct type for the params directly in the function signature
export async function GET(
  request: Request,
  // Updated type: In some Next.js versions/configurations, params might be a Promise
  { params }: { params: Promise<{ id: string }> }
) {
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
