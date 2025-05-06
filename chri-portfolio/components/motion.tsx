"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

type FadeProps = {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  as?: React.ElementType;
};

export function Fade({
  children,
  className,
  direction,
  delay = 0,
  duration = 0.5,
  as: Component = "div",
}: FadeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "none" : getInitialTransform(direction),
    transition: `opacity ${duration}s ease-out, transform ${duration}s ease-out`,
    transitionDelay: `${delay}s`,
  };

  return (
    <Component className={cn(className)} style={style}>
      {children}
    </Component>
  );
}

function getInitialTransform(direction?: "up" | "down" | "left" | "right") {
  switch (direction) {
    case "up":
      return "translateY(20px)";
    case "down":
      return "translateY(-20px)";
    case "left":
      return "translateX(-20px)";
    case "right":
      return "translateX(20px)";
    default:
      return "none";
  }
}

export function FadeGroup({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (!Array.isArray(children)) {
    return <Fade {...{ children, className }} />;
  }

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {children.map((child, index) => (
        <Fade
          {...{ children: child }}
          delay={index * staggerDelay}
          key={index}
        />
      ))}
    </div>
  );
}
