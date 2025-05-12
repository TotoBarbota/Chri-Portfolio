import { AboutContent } from "@/components/about-content";

export default function AboutPage() {
  const skills = [
    "Management",
    "Human Resources",
    "Strategic Planning",
    "Leadership",
    "Business Development",
    "Marketing Strategy",
    "Project Management",
    "Change Management",
  ];

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto">
        <AboutContent skills={skills} />
      </div>
    </div>
  );
}
