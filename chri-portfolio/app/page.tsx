import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Fade } from "@/components/motion";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <Fade direction="up" delay={0.1}>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block">Hello, I&apos;m</span>
            <span className="block text-primary mt-2">
              Christina Anastasopoulou
            </span>
          </h1>
        </Fade>

        <Fade direction="up" delay={0.3}>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            A passionate business and management student eager to learn and grow
            in the world of business.
          </p>
        </Fade>

        <Fade direction="up" delay={0.5}>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button asChild size="lg" className="hover-lift">
              <Link href="/projects">
                View My Work{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="hover-lift">
              <Link href="/about">About Me</Link>
            </Button>
          </div>
        </Fade>
      </div>
    </div>
  );
}
