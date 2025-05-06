// app/api/projects/[id]/route.ts (Assuming App Router: app/api/projects/[id]/route.ts)
// If using Pages Router: pages/api/projects/[id].ts (adjust imports & handler export)
import { NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive"; // Adjust path as needed
import { Readable } from "stream";

// Use the GET function for App Router API routes
export async function GET({ params }: { params: { id: string } }) {
  const fileId = params.id;

  if (!fileId) {
    return NextResponse.json(
      { message: "File ID is required" },
      { status: 400 }
    );
  }

  try {
    const drive = await getDriveService();

    // *** KEY CHANGE: Use alt: 'media' to get the file content stream ***
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media" as const, // Get the file content bytes
      },
      {
        // Instruct googleapis to return a Node.js stream
        responseType: "stream" as "stream",
      }
    );

    // Get the stream from the response data
    const fileStream = response.data as Readable;

    // Create a new Response, piping the stream directly into the body
    const responseStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy(); // Clean up stream if connection is closed
      },
    });

    // Return the stream with the correct Content-Type header
    return new NextResponse(responseStream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf", // Set the correct MIME type
        // 'Content-Disposition': `inline; filename="${fileId}.pdf"`, // Optional: Suggest filename
      },
    });
  } catch (error: any) {
    console.error(`Error fetching project file ${fileId}:`, error);

    let status = 500;
    let message = "Failed to fetch project file.";

    if (error.response?.status) {
      status = error.response.status;
      if (status === 404) message = "File not found.";
      else if (status === 403) message = "Access denied by Google Drive."; // More specific message
    } else if (
      error.errors &&
      error.errors[0] &&
      error.errors[0].reason === "forbidden"
    ) {
      status = 403;
      message = "Access denied by Google Drive.";
    }

    return NextResponse.json({ message: message }, { status: status });
  }
}
