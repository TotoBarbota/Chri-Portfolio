// pages/api/blogs/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { getDriveService } from "@/lib/google-drive";
import matter from "gray-matter"; // Assuming gray-matter for frontmatter

type BlogContentResponse = {
  content: string;
  frontmatter?: any; // Optional: If you parse frontmatter
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BlogContentResponse | { message: string }>
) {
  const { id } = req.query; // id can be string | string[] | undefined

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Ensure id is a single string
  const fileId = Array.isArray(id) ? id[0] : id;

  if (!fileId) {
    return res.status(400).json({ message: "File ID is required" });
  }

  try {
    const drive = await getDriveService();

    const response = await drive.files.get({
      fileId: fileId,
      alt: "media",
    });

    // response.data for text files is typically a Buffer
    const markdownBuffer = response.data as Buffer;
    const markdownContent = markdownBuffer.toString("utf8"); // Assuming UTF-8 encoding

    // Optionally parse frontmatter
    const { data: frontmatter, content } = matter(markdownContent);

    res.status(200).json({ content: content, frontmatter: frontmatter }); // Return parsed content and frontmatter
  } catch (error: any) {
    console.error(`Error fetching blog file ${fileId}:`, error);
    if (error.response?.status === 404) {
      // Access status via response object
      res.status(404).json({ message: "File not found." });
    } else if (
      error.errors &&
      error.errors[0] &&
      error.errors[0].reason === "forbidden"
    ) {
      res
        .status(403)
        .json({ message: "Permission denied to access this file." });
    } else {
      res.status(500).json({ message: "Failed to retrieve file content." });
    }
  }
}
