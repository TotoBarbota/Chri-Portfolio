import { NextRequest, NextResponse } from "next/server";
import { getProjectMetadata } from "@/lib/local-files";

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

    const metadata = await getProjectMetadata(fileId);

    if (!metadata) {
      return NextResponse.json(
        { error: "File metadata not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: metadata.name,
      modifiedTime: metadata.modifiedTime,
      description: metadata.description,
    });
  } catch (error: unknown) {
    console.error("Error in metadata endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch project metadata" },
      { status: 500 }
    );
  }
}
