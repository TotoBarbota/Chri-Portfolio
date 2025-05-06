import { Skeleton } from "@/components/ui/skeleton";

export function ContentLoadingSkeleton({
  viewMode,
}: {
  viewMode: "card-small" | "card-large" | "list";
}) {
  const isList = viewMode === "list";
  const isLargeCard = viewMode === "card-large";

  return (
    <div className="py-12">
      {/* Title Skeleton */}
      {/* <div className="max-w-3xl mx-auto mb-12 text-center">
        <Skeleton className="h-12 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div> */}

      {/* View Toggle Skeleton */}
      <div className="flex justify-end mb-6">
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Content Grid Skeleton */}
      <div
        className={`grid gap-6 ${
          isList
            ? "space-y-6"
            : viewMode === "card-small"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 lg:grid-cols-2"
        }`}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={`${
              isList ? "flex flex-col md:flex-row gap-6" : "h-full"
            }`}
          >
            <Skeleton
              className={`${
                isList ? "md:w-1/3 h-48" : isLargeCard ? "h-80" : "h-56"
              }`}
            />
            <div
              className={`${isList ? "md:w-2/3" : "p-6"} flex-1 flex flex-col`}
            >
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />
              <Skeleton className="h-10 w-32 mt-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
