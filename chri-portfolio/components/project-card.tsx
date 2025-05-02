import { Project } from "@/lib/types";
import { ContentView } from "@/components/content-viewer";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const icon = project.type === 'pdf' ? '📄' : '📊';

  return (
    <div className="rounded-lg border p-6 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold">{project.name}</h3>
      </div>
      <p className="text-muted-foreground mb-4">{project.description}</p>
      <ContentView id={project.id} type="document" />
    </div>
  );
};
