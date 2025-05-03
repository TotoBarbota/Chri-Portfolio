// pages/api/projects/[id].ts
import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";
import { drive_v3 } from "googleapis";
import { Readable } from "stream"; // Node.js stream type

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: fileId } = await params;
  console.log("GET request for file ID: " + fileId);

  if (!fileId) {
    return NextResponse.json(
      { message: "File ID is required" },
      { status: 400 }
    );
  }

  try {
    const drive = await getDriveService();

    const file = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink",
    });

    if (!file.data.webViewLink) {
      throw new Error("File does not have a viewable link");
    }

    return NextResponse.json({
      url: file.data.webViewLink,
    });
  } catch (error: any) {
    console.error(`Error fetching project file ${fileId}:`, error);
    if (error.response?.status === 404) {
      // Access status via response object for googleapis errors
      return NextResponse.json({ message: "File not found." }, { status: 404 });
    } else if (
      error.errors &&
      error.errors[0] &&
      error.errors[0].reason === "forbidden"
    ) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    } else {
      return NextResponse.json(
        { message: "Failed to fetch project file." },
        { status: 500 }
      );
    }
  }
}
