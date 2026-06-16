import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminPageSkeleton() {
  return (
    <div className="grid gap-4">
      <Card className="border-border bg-card/90 shadow-xl backdrop-blur">
        <CardHeader className="gap-3 p-5 md:p-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </CardHeader>
        <CardContent className="grid gap-3 p-5 pt-0 md:grid-cols-3 md:p-6 md:pt-0">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border border-border bg-background/70 p-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-8 w-14" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.34fr]">
        <Card className="border-border bg-card/92 shadow-xl backdrop-blur">
          <CardHeader className="p-5 md:p-6">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-3 h-8 w-56" />
            <Skeleton className="mt-2 h-5 w-full max-w-lg" />
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5 pt-0 md:px-6 md:pb-6">
            <Skeleton className="h-14 w-full" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="grid gap-4 border border-border bg-background/55 p-4 xl:grid-cols-[1fr_320px]">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="grid gap-3 border border-border bg-background/55 p-4">
                  <Skeleton className="h-11 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/88 shadow-sm backdrop-blur">
          <CardHeader className="p-5 md:p-6">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="mt-2 h-5 w-full max-w-xs" />
          </CardHeader>
          <CardContent className="grid gap-2 px-5 pb-5 pt-0 md:px-6 md:pb-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border border-border bg-background/55 p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
