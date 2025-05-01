"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";
import Link from "next/link";
import { Fade } from "@/components/motion";

export default function AboutPage() {
  // Replace with your actual skills
  const skills = [
    "Strategic Planning",
    "Leadership",
    "Business Development",
    "Marketing Strategy",
    "Financial Analysis",
    "Project Management",
    "Public Speaking",
    "Negotiation",
    "Team Building",
    "Change Management",
  ];

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-12 md:grid-cols-[2fr_3fr] items-start">
          <Fade direction="right" className="space-y-6">
            <div className="relative mx-auto w-48 h-48 md:w-full md:h-auto md:aspect-square overflow-hidden rounded-full md:rounded-lg">
              <Image
                src="/placeholder.svg?height=400&width=400"
                alt="Profile picture"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">Your Name</h1>
              <p className="text-muted-foreground">Frontend Developer</p>
            </div>

            <div className="flex justify-center md:justify-start gap-4">
              <Button asChild className="hover-lift">
                <Link href="mailto:your.email@example.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Me
                </Link>
              </Button>
              <Button variant="outline" asChild className="hover-lift">
                <Link href="/resume.pdf">
                  <Download className="mr-2 h-4 w-4" />
                  Resume
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
                      Hello! I'm a passionate business strategist with a keen
                      eye for opportunities and a talent for driving growth and
                      innovation.
                    </p>
                    <p>
                      With several years of experience in business development
                      and strategic planning, I specialize in identifying market
                      opportunities and developing actionable plans to
                      capitalize on them. I'm dedicated to creating sustainable
                      growth and delivering exceptional results.
                    </p>
                    <p>
                      When I'm not working on business strategies, you can find
                      me mentoring aspiring entrepreneurs, speaking at industry
                      events, or exploring new market trends.
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
                      <h3 className="font-semibold">
                        Senior Business Strategist
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Company Name • 2021 - Present
                      </p>
                      <p className="mt-2 text-muted-foreground">
                        Led strategic initiatives resulting in 40% revenue
                        growth and successful market expansion.
                      </p>
                    </div>
                    <div className="transition-all hover:translate-x-1">
                      <h3 className="font-semibold">
                        Business Development Manager
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Previous Company • 2018 - 2021
                      </p>
                      <p className="mt-2 text-muted-foreground">
                        Developed and executed growth strategies, securing key
                        partnerships and expanding into new markets.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Fade>
          </div>
        </div>
      </div>
    </div>
  );
}
