import { NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";

export async function GET({ params }: { params: { id: string } }) {
  try {
    const drive = await getDriveService();

    const fileId = params.id;

    const response = await drive.files.get({
      fileId: fileId,
      fields: "name, modifiedTime, webViewLink",
    });

    console.log("Received response from Google Drive API");

    return NextResponse.json({
      name: response.data.name,
      modifiedTime: response.data.modifiedTime,
      webViewLink: response.data.webViewLink,
    });
  } catch (error: any) {
    console.error("Error in metadata endpoint:");
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error details:", error);
    }

    return NextResponse.json(
      {
        error: "Failed to fetch project metadata",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
