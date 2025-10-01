// app/api/files/pictures/[filename]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPictureFile } from "@/lib/local-files";

function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
): Promise<NextResponse> {
  const { filename } = await params;

  if (!filename) {
    return NextResponse.json(
      { message: "Filename is required" },
      { status: 400 }
    );
  }

  try {
    const fileBuffer = await getPictureFile(filename);

    if (!fileBuffer) {
      return NextResponse.json(
        { message: "Picture not found" },
        { status: 404 }
      );
    }

    const mimeType = getMimeTypeFromFilename(filename);

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: unknown) {
    console.error(`Error fetching picture file ${filename}:`, error);
    return NextResponse.json(
      { message: "Failed to fetch picture file" },
      { status: 500 }
    );
  }
}
