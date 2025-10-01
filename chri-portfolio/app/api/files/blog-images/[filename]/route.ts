// app/api/files/blog-images/[filename]/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const BLOG_IMAGES_DIR = path.join(process.cwd(), "files", "Blog-Images");

/**
 * Get the mime type based on file extension
 */
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".bmp": "image/bmp",
    ".ico": "image/x-icon",
  };
  return mimeTypes[ext] || "application/octet-stream";
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
    // Security check: prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(BLOG_IMAGES_DIR, sanitizedFilename);

    // Ensure the resolved path is within BLOG_IMAGES_DIR
    const resolvedPath = path.resolve(filePath);
    const resolvedBlogImagesDir = path.resolve(BLOG_IMAGES_DIR);

    if (!resolvedPath.startsWith(resolvedBlogImagesDir)) {
      return NextResponse.json(
        { message: "Invalid file path" },
        { status: 400 }
      );
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    const mimeType = getMimeType(sanitizedFilename);

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: unknown) {
    console.error(`Error fetching blog image ${filename}:`, error);

    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Failed to fetch blog image" },
      { status: 500 }
    );
  }
}
