// app/api/projects/[id]/route.ts (Assuming App Router: app/api/projects/[id]/route.ts)
// If using Pages Router: pages/api/projects/[id].ts (adjust imports & handler export)
import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive"; // Adjust path as needed
import { Readable } from "stream";

interface GoogleApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  errors?: Array<{
    reason: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const fileId = id;

  if (!fileId) {
    return NextResponse.json(
      { message: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    const drive = await getDriveService();

    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media" as const,
      },
      {
        responseType: "stream" as const,
      }
    );

    const fileStream = response.data as Readable;

    const responseStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      },
    });

    return new NextResponse(responseStream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error: unknown) {
    console.error(`Error fetching project file ${fileId}:`, error);
    let status = 500;
    let message = "Failed to fetch project file.";

    const apiError = error as GoogleApiError;

    if (apiError.response?.status) {
      status = apiError.response.status;
      if (status === 404) message = "File not found.";
      else if (status === 403) message = "Access denied by Google Drive.";
    } else if (apiError.errors?.[0]?.reason === "forbidden") {
      status = 403;
      message = "Access denied by Google Drive.";
    }

    return NextResponse.json({ message }, { status });
  }
}
