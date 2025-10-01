// app/api/resume/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET() {
  try {
    // Look for resume file in the files directory
    const filesDir = path.join(process.cwd(), "files");
    const resumePath = path.join(filesDir, "resume.pdf");

    // Check if resume file exists
    try {
      await fs.access(resumePath);
    } catch {
      return NextResponse.json(
        {
          message:
            "Resume file not found. Please add resume.pdf to the files directory.",
        },
        { status: 404 }
      );
    }

    // Read the resume file
    const fileBuffer = await fs.readFile(resumePath);

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error: unknown) {
    console.error("Error downloading resume:", error);
    return NextResponse.json(
      { message: "Failed to download resume" },
      { status: 500 }
    );
  }
}
