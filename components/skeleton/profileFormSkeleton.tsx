import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileFormSkeleton = () => {
  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 w-full">
      {/* Profile Header Skeleton */}
      <Card className="border-border/50 bg-linear-to-br from-card to-card/50 w-full">
        <CardContent className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6 pt-2 xs:pt-3 sm:pt-4 md:pt-5 lg:pt-6">
          <div className="flex flex-col xs:flex-col sm:flex-row items-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            <Skeleton className="h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full shrink-0" />
            <div className="flex-1 text-center xs:text-center sm:text-left w-full space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-3">
              <Skeleton className="h-5 xs:h-6 sm:h-7 md:h-8 w-32 xs:w-40 sm:w-48 md:w-56 mx-auto sm:mx-0" />
              <Skeleton className="h-4 xs:h-4 sm:h-5 md:h-5 w-40 xs:w-48 sm:w-56 md:w-64 mx-auto sm:mx-0" />
              <Skeleton className="h-3 xs:h-4 sm:h-4 md:h-4 w-28 xs:w-32 sm:w-36 md:w-40 mx-auto sm:mx-0" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Skeleton */}
      <Card className="border-border/50 w-full">
        <CardHeader className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
          <Skeleton className="h-5 xs:h-6 sm:h-6 md:h-7 w-28 xs:w-32 sm:w-40 md:w-48" />
          <Skeleton className="h-3 xs:h-4 sm:h-4 md:h-4 w-40 xs:w-48 sm:w-56 md:w-64 mt-1.5 xs:mt-2 sm:mt-2 md:mt-3" />
        </CardHeader>
        <CardContent className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
          <div className="space-y-3 xs:space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-4">
              <div className="space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-2">
                <Skeleton className="h-3 xs:h-3.5 sm:h-4 md:h-4 w-16 xs:w-18 sm:w-20 md:w-24" />
                <Skeleton className="h-8 xs:h-9 sm:h-10 md:h-10 w-full" />
              </div>
              <div className="space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-2">
                <Skeleton className="h-3 xs:h-3.5 sm:h-4 md:h-4 w-20 xs:w-22 sm:w-24 md:w-28" />
                <Skeleton className="h-8 xs:h-9 sm:h-10 md:h-10 w-full" />
              </div>
            </div>
            <div className="flex flex-col xs:flex-col sm:flex-row gap-1.5 xs:gap-2 sm:gap-2 md:gap-3 pt-2 xs:pt-3 sm:pt-4 md:pt-4 border-t border-border">
              <Skeleton className="h-8 xs:h-9 sm:h-10 md:h-10 w-full sm:w-24 md:w-32" />
              <Skeleton className="h-8 xs:h-9 sm:h-10 md:h-10 w-full sm:w-20 md:w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
