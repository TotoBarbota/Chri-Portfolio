"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ViewMode, ViewToggle } from "./view-toggle";

export function ViewToggleClient({ defaultView }: { defaultView: ViewMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view = searchParams.get('view') as ViewMode || defaultView;

  const handleViewChange = (newView: ViewMode) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', newView);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <ViewToggle
      onChange={handleViewChange}
      defaultValue={view}
    />
  );
}
