// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getProjectFile } from "@/lib/local-files";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const fileId = id;

  console.log(`[API] Received project ID: "${fileId}"`);
  console.log(`[API] Full URL: ${request.url}`);

  if (!fileId) {
    return NextResponse.json(
      { message: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    const fileBuffer = await getProjectFile(fileId);

    if (!fileBuffer) {
      console.error(`[API] File not found for slug: "${fileId}"`);
      return NextResponse.json(
        { message: "File not found.", slug: fileId },
        { status: 404 }
      );
    }

    console.log(
      `[API] Successfully loaded project file, size: ${fileBuffer.length} bytes`
    );

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": fileBuffer.length.toString(),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  } catch (error: unknown) {
    console.error(`Error fetching project file ${fileId}:`, error);
    return NextResponse.json(
      { message: "Failed to fetch project file." },
      { status: 500 }
    );
  }
}
