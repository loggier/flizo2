
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleListSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-12 w-1/2 rounded-lg" />
          <div className="space-y-4">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex items-center p-4 rounded-xl shadow-md gap-4 bg-gray-100">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-5/6 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
                <div className="flex-shrink-0 text-center">
                  <Skeleton className="h-8 w-12 rounded-md" />
                  <Skeleton className="h-4 w-8 rounded-md mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
