import { NextResponse } from "next/server";
import { getDriveService, DriveFile } from "@/lib/google-drive";

export async function GET() {
  try {
    const drive = await getDriveService();
    const projectsFolderId = process.env.PROJECTS_FOLDER_ID;

    if (!projectsFolderId) {
      return NextResponse.json(
        { message: "Projects folder ID not configured." },
        { status: 500 }
      );
    }

    const response = await drive.files.list({
      q: `'${projectsFolderId}' in parents and mimeType='application/pdf'`, // Filter by PDF mimeType directly
      fields: "files(id, name, mimeType)",
    });

    // Ensure response.data.files is treated as the DriveFile[] type, handle undefined
    const files = (response.data.files as DriveFile[] | undefined) || [];

    return NextResponse.json({
      message: "Projects folder ID configured.",
      data: files,
    });
  } catch (error: any) {
    console.error("Error listing project files:", error);
    return NextResponse.json(
      { message: "Failed to list project files." },
      { status: 500 }
    );
  }
}
