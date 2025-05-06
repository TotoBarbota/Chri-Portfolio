import { NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive";

// Add proper type for the params
interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id: fileId } = params; // Destructure and rename
    const drive = await getDriveService();

    const response = await drive.files.get({
      fileId,
      fields: "name, modifiedTime, webViewLink",
    });

    return NextResponse.json({
      name: response.data.name,
      modifiedTime: response.data.modifiedTime,
      webViewLink: response.data.webViewLink,
    });
  } catch (error: any) {
    console.error("Error in metadata endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch project metadata" },
      { status: 500 }
    );
  }
}
