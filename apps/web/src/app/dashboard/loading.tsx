import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-4">
      <section className="grid gap-4 border border-border bg-card p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="grid gap-3">
            <Skeleton className="h-10 w-64 rounded-none" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-none" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-none" />
            <Skeleton className="h-10 w-36 rounded-none" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-none" />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1.1fr]">
        <Skeleton className="h-96 rounded-none" />
        <Skeleton className="h-96 rounded-none" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-72 rounded-none" />
        ))}
      </section>
    </div>
  );
}
