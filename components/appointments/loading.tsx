import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function AppointmentsSkeleton() {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    </Card>
  )
}