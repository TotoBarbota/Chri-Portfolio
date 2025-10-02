// app/api/debug/files/route.ts
import { NextResponse } from "next/server";
import { listProjects, listBlogs } from "@/lib/local-files";

export async function GET() {
  try {
    const projects = await listProjects();
    const blogs = await listBlogs();

    return NextResponse.json({
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        fileName: p.fileName,
      })),
      blogs: blogs.map(b => ({
        id: b.id,
        name: b.name,
        fileName: b.fileName,
      })),
    });
  } catch (error: unknown) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}
