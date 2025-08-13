
import { Skeleton } from "@/components/ui/skeleton";

export function AlertsListSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start gap-4 bg-white rounded-xl shadow-md p-3">
          <div className="flex-shrink-0 w-20 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
