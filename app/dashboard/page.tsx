import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardStats } from '@/components/dashboard/stats'
import { AppointmentsList } from '@/components/dashboard/appointments-list'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { StaffStatus } from '@/components/dashboard/staff-status'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { DashboardSkeleton } from '@/components/dashboard/loading'

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader />
      <Suspense fallback={<DashboardSkeleton />}>
        <div className="grid gap-6">
          <DashboardStats />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppointmentsList />
            <ActivityFeed />
          </div>
          <MetricsGrid />
          <StaffStatus />
        </div>
      </Suspense>
    </DashboardShell>
  )
}