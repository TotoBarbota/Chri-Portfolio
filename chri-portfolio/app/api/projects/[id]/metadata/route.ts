import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";

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

    const apiError = error as GoogleApiError;
    let status = 500;
    let message = "Failed to fetch project metadata";

    if (apiError.response?.status) {
      status = apiError.response.status;
      if (status === 404) message = "File metadata not found";
      else if (status === 403) message = "Access denied by Google Drive";
    } else if (apiError.errors?.[0]?.reason === "forbidden") {
      status = 403;
      message = "Access denied by Google Drive";
    }

    return NextResponse.json({ error: message }, { status });
  }
}
