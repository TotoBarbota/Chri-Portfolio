// pages/api/blogs.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getDriveService, DriveFile } from "@/lib/google-drive";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DriveFile[] | { message: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const drive = await getDriveService();
    const blogsFolderId = process.env.GOOGLE_BLOGS_FOLDER_ID;

    if (!blogsFolderId) {
      return res
        .status(500)
        .json({ message: "Blogs folder ID not configured." });
    }

    const response = await drive.files.list({
      q: `'${blogsFolderId}' in parents and (mimeType='text/markdown' or mimeType='text/plain')`, // Filter by likely MD mimeTypes
      fields: "files(id, name, mimeType)",
    });

    const files = (response.data.files as DriveFile[] | undefined) || [];

    // Refine filtering client-side for .md extension if needed
    const mdFiles = files.filter(
      (file) =>
        file.mimeType === "text/markdown" ||
        (file.mimeType === "text/plain" && file.name.endsWith(".md"))
    );

    res.status(200).json(mdFiles);
  } catch (error: any) {
    console.error("Error listing blog files:", error);
    res.status(500).json({ message: "Failed to list blog files." });
  }
}
