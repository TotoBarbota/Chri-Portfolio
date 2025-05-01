"use client";

import { Grid2X2, Grid3X3, List } from "lucide-react";
import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ViewMode = "list" | "card-small" | "card-large";

interface ViewToggleProps {
  onChange: (value: ViewMode) => void;
  defaultValue?: ViewMode;
  storageKey?: string;
}

export function ViewToggle({
  onChange,
  defaultValue = "card-small",
  storageKey,
}: ViewToggleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultValue);

  // Load saved preference from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      const savedView = localStorage.getItem(storageKey) as ViewMode | null;
      if (savedView) {
        setViewMode(savedView);
      }
    }
  }, [storageKey]);

  // Update state and save preference when changed
  const handleViewChange = (value: string) => {
    if (!value) return;
    const newValue = value as ViewMode;
    setViewMode(newValue);
    onChange(newValue);

    if (storageKey) {
      localStorage.setItem(storageKey, newValue);
    }
  };

  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={handleViewChange}
        className="border rounded-md"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="list"
              aria-label="List view"
              className="data-[state=on]:bg-primary/20"
            >
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>List view</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="card-small"
              aria-label="Small card view"
              className="data-[state=on]:bg-primary/20"
            >
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Small cards</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="card-large"
              aria-label="Large card view"
              className="data-[state=on]:bg-primary/20"
            >
              <Grid2X2 className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Large cards</TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  );
}
