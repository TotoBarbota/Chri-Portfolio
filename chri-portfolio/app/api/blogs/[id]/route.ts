// app/api/blogs/[id]/route.ts (Assuming App Router)
// If using Pages Router: pages/api/blogs/[id].ts (adjust imports and export default handler)

import { NextRequest, NextResponse } from "next/server";
import { getDriveService } from "@/lib/google-drive"; // Adjust path as needed
import matter from "gray-matter"; // Import gray-matter

// Define the expected structure for the blog content response
interface BlogContentResponse {
  content: string; // The Markdown content after frontmatter
  frontmatter?: any; // The parsed frontmatter data (adjust type if you know its structure)
  message?: string; // For error messages
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const fileId = params.id;
  console.log("GET request for blog file ID:", fileId);

  if (!fileId) {
    return NextResponse.json(
      { message: "File ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Getting Drive service...");
    const drive = await getDriveService();
    console.log("Drive service obtained");

    console.log(`Fetching blog file content for ${fileId}...`);

    // Fetch the file content using alt: 'media'
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media", // Get the file content bytes
      },
      {
        // No responseType: 'stream' needed if you expect text,
        // the default is to return a buffer or string depending on the library version/config.
      }
    );

    // response.data for text files is typically a Buffer
    const markdownBuffer = response.data as Buffer;
    const markdownContentRaw = markdownBuffer.toString("utf8"); // Assuming UTF-8 encoding

    // *** Use gray-matter to parse frontmatter and content ***
    const { data: frontmatter, content } = matter(markdownContentRaw);

    // Return the parsed content and frontmatter
    return NextResponse.json({
      content: content,
      frontmatter: frontmatter,
    } as BlogContentResponse); // Cast to the defined type
  } catch (error: any) {
    console.error(`Error fetching blog file ${fileId}:`, error);

    let status = 500;
    let message = "Failed to fetch blog file.";

    if (error.response?.status) {
      status = error.response.status;
      if (status === 404) message = "Blog file not found.";
      else if (status === 403) message = "Access denied by Google Drive.";
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
