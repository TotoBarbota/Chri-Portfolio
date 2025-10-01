import { NextRequest, NextResponse } from "next/server";
import { getProjectMetadata } from "@/lib/local-files";

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
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await context.params;
  const fileId = params.id;

  console.log(`[API Metadata] Received project ID: "${fileId}"`);

  try {
    if (!fileId) {
      return NextResponse.json(
        { message: "Project ID is required in the route path" },
        { status: 400 }
      );
    }

    const metadata = await getProjectMetadata(fileId);

    if (!metadata) {
      return NextResponse.json(
        { error: "File metadata not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        name: metadata.name,
        modifiedTime: metadata.modifiedTime,
        description: metadata.description,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Error in metadata endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch project metadata" },
      { status: 500 }
    );
  }
}
