// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { listProjects } from "@/lib/local-files";

// Define the expected structure for the project list response
type ProjectListItem = {
  id: string;
  name: string;
  modifiedTime: string;
  description?: string;
  thumbnailUrl?: string;
};

export async function GET() {
  try {
    const projects = await listProjects();

    const projectListItems: ProjectListItem[] = projects.map((project) => ({
      id: project.id,
      name: project.name,
      modifiedTime: project.modifiedTime,
      description: project.description,
      thumbnailUrl: project.thumbnailPath,
    }));

    return NextResponse.json(projectListItems);
  } catch (error: unknown) {
    console.error("Error listing projects:", error);
    return NextResponse.json(
      { message: "Failed to list project files." },
      { status: 500 }
    );
  }
}
