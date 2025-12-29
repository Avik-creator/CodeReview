import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function RepositoryCardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="flex flex-col xs:flex-row items-start xs:items-start justify-between gap-2 xs:gap-3 sm:gap-4">
          <div className="space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-3 flex-1 w-full">
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1.5 xs:gap-2 sm:gap-2 md:gap-3">
              <Skeleton className="h-5 xs:h-6 sm:h-6 md:h-6 w-32 xs:w-40 sm:w-48 md:w-56" />
              <Skeleton className="h-4 xs:h-5 sm:h-5 md:h-5 w-14 xs:w-16 sm:w-20 md:w-24" />
            </div>
            <Skeleton className="h-3 xs:h-4 sm:h-4 md:h-4 w-full max-w-xs xs:max-w-sm sm:max-w-md" />
          </div>
          <div className="flex gap-1.5 xs:gap-2 sm:gap-2 md:gap-3 w-full xs:w-auto flex-shrink-0">
            <Skeleton className="h-8 xs:h-8 sm:h-9 md:h-9 w-8 xs:w-8 sm:w-9 md:w-9" />
            <Skeleton className="h-8 xs:h-8 sm:h-9 md:h-9 w-20 xs:w-20 sm:w-24 md:w-28" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
        <div className="flex flex-wrap items-center gap-2 xs:gap-2 sm:gap-3 md:gap-4">
          <Skeleton className="h-3 xs:h-3.5 sm:h-4 md:h-4 w-12 xs:w-14 sm:w-16 md:w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function RepositoryListSkeleton() {
  return (
    <div className="grid gap-2 xs:gap-3 sm:gap-3 md:gap-4 lg:gap-5 w-full grid-cols-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <RepositoryCardSkeleton key={i} />
      ))}
    </div>
  );
}
