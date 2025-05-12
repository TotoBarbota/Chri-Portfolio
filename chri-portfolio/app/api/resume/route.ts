import { NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";

export async function GET() {
  try {
    const resumeFileId = process.env.RESUME_FILE_ID;

    if (!resumeFileId) {
      return NextResponse.json(
        { message: "Resume file ID not configured." },
        { status: 500 }
      );
    }

    const drive = await getDriveService();

    // Get the file metadata first to get the filename
    const fileMetadata = await drive.files.get({
      fileId: resumeFileId,
      fields: "name",
    });

    // Get the file content
    const response = await drive.files.get(
      {
        fileId: resumeFileId,
        alt: "media",
      },
      {
        responseType: "arraybuffer",
      }
    );

    const buffer = Buffer.from(response.data as ArrayBuffer);

    // Return the file with proper headers for download
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileMetadata.data.name}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading resume:", error);
    return NextResponse.json(
      { message: "Failed to download resume" },
      { status: 500 }
    );
  }
}
