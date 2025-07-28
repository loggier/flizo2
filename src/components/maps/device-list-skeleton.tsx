
import { Skeleton } from "@/components/ui/skeleton";
import { LoaderIcon } from "../icons/loader-icon";

export function DeviceListSkeleton() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-center py-8">
        <LoaderIcon className="h-8 w-8 text-primary" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 py-3">
          <Skeleton className="h-4 w-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
