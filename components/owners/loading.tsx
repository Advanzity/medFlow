import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function OwnerListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-10" />
        </div>
        <Skeleton className="h-10 w-[100px]" />
      </div>

      <Card>
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
              <div className="space-y-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}