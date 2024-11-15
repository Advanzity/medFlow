import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { OwnerHeader } from '@/components/owners/owner-header'
import { OwnerDetails } from '@/components/owners/owner-details'
import { Skeleton } from '@/components/ui/skeleton'

interface OwnerPageProps {
  params: {
    id: string
  }
}

export default function OwnerDetailsPage({ params }: OwnerPageProps) {
  return (
    <DashboardShell>
      <Suspense fallback={<Skeleton className="h-[200px]" />}>
        <OwnerHeader ownerId={params.id} />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <OwnerDetails ownerId={params.id} />
      </Suspense>
    </DashboardShell>
  )
}