import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fade } from "@/components/motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { ResumeDownloadButton } from "./resume-download-button";

interface AboutContentProps {
  skills: string[];
}

export function AboutContent({ skills }: AboutContentProps) {
  return (
    <div className="grid gap-12 md:grid-cols-[2fr_3fr] items-start">
      <Fade direction="right" className="space-y-6">
        <div className="relative mx-auto w-48 h-48 md:w-full md:h-auto md:aspect-square overflow-hidden rounded-full md:rounded-lg">
          <Image
            src="/christina-profile.png"
            alt="Profile picture"
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            priority
          />
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">Christina Anastasopoulou</h1>
          <p className="text-muted-foreground">
            BA (Hons) Business and Management
          </p>
        </div>

        <div className="flex justify-center md:justify-start gap-4">
          <Button asChild className="hover-lift">
            <Link href="mailto:christina.ananastasopoulou@outlook.com">
              <Mail className="mr-2 h-4 w-4" />
              Contact Me
            </Link>
          </Button>
          <ResumeDownloadButton />
          <Button variant="outline" size="icon" asChild className="hover-lift">
            <Link
              href="https://www.linkedin.com/in/christina-anastasopoulou"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faLinkedin} className="h-4 w-4" />
              <span className="sr-only">LinkedIn Profile</span>
            </Link>
          </Button>
        </div>
      </Fade>

      <div className="space-y-8">
        <Fade direction="left" delay={0.1}>
          <Card className="hover-scale transition-all">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">About Me</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Hello! I&apos;m a multilingual and versatile individual with a
                  BA in Spanish Studies and currently studying for my second BA
                  in Business and Management. My academic background reflects my
                  passion for both languages as well as business strategy and
                  growth.
                </p>
                <p>
                  Over the years, I&apos;ve enriched my knowledge through
                  various projects and certifications, including the ICDL
                  certification in computer literacy, an HR bootcamp certified
                  by HRCI, and additional certifications in agile practices.
                </p>
                <p>
                  When I&apos;m not studying, you will find me exploring new
                  places or diving into a good book. I believe in lifelong
                  learning and I&apos;m driven by the desire to contribute
                  meaningfully.
                </p>
              </div>
            </CardContent>
          </Card>
        </Fade>

        <Fade direction="left" delay={0.2}>
          <Card className="hover-scale transition-all">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="transition-all hover:bg-primary/20"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </Fade>

        <Fade direction="left" delay={0.3}>
          <Card className="hover-scale transition-all">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Experience</h2>
              <div className="space-y-4">
                <div className="transition-all hover:translate-x-1">
                  <h3 className="font-semibold">Language Tutor</h3>
                  <p className="text-sm text-muted-foreground">
                    Self-employed • 2021-2025
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    Provided personalized tutoring in English, Spanish, and
                    Greek to learners of all levels.
                  </p>
                </div>
                <div className="transition-all hover:translate-x-1">
                  <h3 className="font-semibold">
                    Product and E-commerce Coordinator
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    MS Parts • Aug 2024-Nov 2024
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    Monitored and updated product listings, ensuring accuracy
                    and consistency across ERP and online platforms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Fade>
      </div>
    </div>
  );
}
