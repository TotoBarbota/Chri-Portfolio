// lib/local-files.ts
// Utility functions for reading local files from the files directory

import fs from "fs/promises";
import path from "path";

// Base directory for all content files
const FILES_BASE_DIR = path.join(process.cwd(), "files");
const PROJECTS_DIR = path.join(FILES_BASE_DIR, "Projects");
const BLOGS_DIR = path.join(FILES_BASE_DIR, "Blogs");
const PICTURES_DIR = path.join(FILES_BASE_DIR, "Pictures");

export type LocalFile = {
  id: string; // URL-safe slug
  name: string; // filename without extension (display name)
  fileName: string; // full filename with extension
  mimeType: string;
  modifiedTime: string;
  description?: string;
  thumbnailPath?: string; // relative path to thumbnail
};

/**
 * Convert a filename to a URL-safe slug (just lowercase since files are already sanitized)
 */
function createSlug(filename: string): string {
  return filename.toLowerCase();
}

/**
 * Convert a sanitized filename to a display name
 * Single dash (-) becomes space, double dash (--) becomes colon with space (: )
 */
function formatDisplayName(filename: string): string {
  return filename
    .replace(/--/g, ":::COLON:::") // Temporarily replace -- with placeholder
    .replace(/-/g, " ") // Replace single - with space
    .replace(/:::COLON:::/g, ": "); // Replace placeholder with colon and space
}

/**
 * Get the mime type based on file extension
 */
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".md": "text/markdown",
    ".txt": "text/plain",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Read description file if it exists
 */
async function readDescription(
  directory: string,
  baseName: string
): Promise<string | undefined> {
  try {
    const descriptionPath = path.join(directory, `${baseName}.description`);
    const description = await fs.readFile(descriptionPath, "utf-8");
    return description.trim();
  } catch {
    return undefined;
  }
}

/**
 * Find matching thumbnail for a file
 */
async function findThumbnail(baseName: string): Promise<string | undefined> {
  try {
    const files = await fs.readdir(PICTURES_DIR);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    for (const ext of imageExtensions) {
      if (files.includes(`${baseName}${ext}`)) {
        return `/api/files/pictures/${baseName}${ext}`;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * List all project files (PDFs)
 */
export async function listProjects(): Promise<LocalFile[]> {
  try {
    const files = await fs.readdir(PROJECTS_DIR);
    const pdfFiles = files.filter(
      (file) => file.endsWith(".pdf") && !file.startsWith(".")
    );

    const projects = await Promise.all(
      pdfFiles.map(async (fileName) => {
        const filePath = path.join(PROJECTS_DIR, fileName);
        const stats = await fs.stat(filePath);
        const baseName = path.basename(fileName, ".pdf");
        const description = await readDescription(PROJECTS_DIR, baseName);
        const thumbnailPath = await findThumbnail(baseName);

        return {
          id: createSlug(baseName), // URL-safe slug (lowercase)
          name: formatDisplayName(baseName), // Display name with spaces and colons
          fileName: fileName,
          mimeType: getMimeType(fileName),
          modifiedTime: stats.mtime.toISOString(),
          description,
          thumbnailPath,
        };
      })
    );

    // Sort by modification time descending (newest first)
    return projects.sort(
      (a, b) =>
        new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
    );
  } catch (error) {
    console.error("Error listing projects:", error);
    return [];
  }
}

/**
 * List all blog files (Markdown)
 */
export async function listBlogs(): Promise<LocalFile[]> {
  try {
    const files = await fs.readdir(BLOGS_DIR);
    const mdFiles = files.filter(
      (file) => file.endsWith(".md") && !file.startsWith(".")
    );

    const blogs = await Promise.all(
      mdFiles.map(async (fileName) => {
        const filePath = path.join(BLOGS_DIR, fileName);
        const stats = await fs.stat(filePath);
        const baseName = path.basename(fileName, ".md");
        const description = await readDescription(BLOGS_DIR, baseName);
        const thumbnailPath = await findThumbnail(baseName);

        return {
          id: createSlug(baseName), // URL-safe slug (lowercase)
          name: formatDisplayName(baseName), // Display name with spaces and colons
          fileName: fileName,
          mimeType: getMimeType(fileName),
          modifiedTime: stats.mtime.toISOString(),
          description,
          thumbnailPath,
        };
      })
    );

    // Sort by modification time descending (newest first)
    return blogs.sort(
      (a, b) =>
        new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
    );
  } catch (error) {
    console.error("Error listing blogs:", error);
    return [];
  }
}

/**
 * Find a file by slug - searches all files in directory and matches by slug
 */
async function findFileBySlug(
  directory: string,
  slug: string,
  extension: string
): Promise<string | null> {
  try {
    console.log(
      `[findFileBySlug] Searching for slug: "${slug}" in ${directory} with extension ${extension}`
    );
    const files = await fs.readdir(directory);
    const matchingFiles = files.filter(
      (file) => file.endsWith(extension) && !file.startsWith(".")
    );

    console.log(
      `[findFileBySlug] Found ${matchingFiles.length} files with extension ${extension}`
    );
    console.log(`[findFileBySlug] Files: ${JSON.stringify(matchingFiles)}`);

    for (const fileName of matchingFiles) {
      const baseName = path.basename(fileName, extension);
      const fileSlug = createSlug(baseName);
      console.log(
        `[findFileBySlug] Checking file: "${fileName}" -> baseName: "${baseName}" -> slug: "${fileSlug}"`
      );

      if (fileSlug === slug) {
        console.log(`[findFileBySlug] ✓ MATCH FOUND: "${baseName}"`);
        return baseName;
      }
    }

    console.log(`[findFileBySlug] ✗ No match found for slug: "${slug}"`);
    return null;
  } catch (error) {
    console.error(
      `[findFileBySlug] Error finding file by slug ${slug}:`,
      error
    );
    return null;
  }
}

/**
 * Get a specific project file by ID (URL-safe slug)
 */
export async function getProjectFile(id: string): Promise<Buffer | null> {
  try {
    // Find the actual filename from the slug
    const baseName = await findFileBySlug(PROJECTS_DIR, id, ".pdf");
    if (!baseName) {
      console.log(`[getProjectFile] No file found for slug: "${id}"`);
      return null;
    }

    const filePath = path.join(PROJECTS_DIR, `${baseName}.pdf`);
    console.log(`[getProjectFile] Looking for file: "${filePath}"`);
    return await fs.readFile(filePath);
  } catch (error) {
    console.error(`Error reading project file ${id}:`, error);
    return null;
  }
}

/**
 * Get a specific blog file by ID (URL-safe slug)
 */
export async function getBlogFile(id: string): Promise<string | null> {
  try {
    // Find the actual filename from the slug
    const baseName = await findFileBySlug(BLOGS_DIR, id, ".md");
    if (!baseName) {
      console.log(`[getBlogFile] No file found for slug: "${id}"`);
      return null;
    }

    const filePath = path.join(BLOGS_DIR, `${baseName}.md`);
    console.log(`[getBlogFile] Looking for file: "${filePath}"`);
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    console.error(`Error reading blog file ${id}:`, error);
    return null;
  }
}

/**
 * Get project metadata by ID (URL-safe slug)
 */
export async function getProjectMetadata(id: string): Promise<{
  name: string;
  modifiedTime: string;
  description?: string;
} | null> {
  try {
    // Find the actual filename from the slug
    const baseName = await findFileBySlug(PROJECTS_DIR, id, ".pdf");
    if (!baseName) {
      console.log(`[getProjectMetadata] No file found for slug: "${id}"`);
      return null;
    }

    const filePath = path.join(PROJECTS_DIR, `${baseName}.pdf`);
    console.log(`[getProjectMetadata] Looking for file: "${filePath}"`);
    const stats = await fs.stat(filePath);
    const description = await readDescription(PROJECTS_DIR, baseName);

    return {
      name: formatDisplayName(baseName), // Format display name with spaces and colons
      modifiedTime: stats.mtime.toISOString(),
      description,
    };
  } catch (error) {
    console.error(`Error reading project metadata ${id}:`, error);
    return null;
  }
}

/**
 * Get a picture/thumbnail file by filename
 */
export async function getPictureFile(filename: string): Promise<Buffer | null> {
  try {
    const filePath = path.join(PICTURES_DIR, filename);
    // Security check: ensure the path is within PICTURES_DIR
    const resolvedPath = path.resolve(filePath);
    const resolvedPicturesDir = path.resolve(PICTURES_DIR);

    if (!resolvedPath.startsWith(resolvedPicturesDir)) {
      throw new Error("Invalid file path");
    }

    return await fs.readFile(filePath);
  } catch (error) {
    console.error(`Error reading picture file ${filename}:`, error);
    return null;
  }
}
