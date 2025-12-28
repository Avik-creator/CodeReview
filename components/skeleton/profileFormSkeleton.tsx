import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileFormSkeleton = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Profile Header Skeleton */}
      <Card className="border-border/50 bg-linear-to-br from-card to-card/50">
        <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full shrink-0" />
            <div className="flex-1 text-center sm:text-left w-full space-y-2">
              <Skeleton className="h-7 sm:h-8 w-48 mx-auto sm:mx-0" />
              <Skeleton className="h-5 w-64 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-40 mx-auto sm:mx-0" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Skeleton */}
      <Card className="border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-border">
              <Skeleton className="h-10 w-full sm:w-32" />
              <Skeleton className="h-10 w-full sm:w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
