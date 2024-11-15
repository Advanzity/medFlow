import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { OwnerList } from '@/components/owners/owner-list'
import { OwnerListSkeleton } from '@/components/owners/loading'

export default function OwnersPage() {
  return (
    <DashboardShell>
      <DashboardHeader />
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pet Owners</h2>
          <p className="text-muted-foreground">
            Manage pet owners and their information
          </p>
        </div>
        <Suspense fallback={<OwnerListSkeleton />}>
          <OwnerList />
        </Suspense>
      </div>
    </DashboardShell>
  )
}