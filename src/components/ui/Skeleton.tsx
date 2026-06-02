import { cn } from "@/lib/utils";

/** Shimmer placeholder. Reserve the same footprint as the real content. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-sm", className)} />;
}

/** A few stacked lines, e.g. while an AI message loads. */
export function MessageSkeleton() {
  return (
    <div className="flex w-full max-w-[80%] flex-col gap-2" aria-hidden>
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  );
}
