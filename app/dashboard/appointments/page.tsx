import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { CalendarView } from '@/components/appointments/calendar-view'
import { AppointmentsSkeleton } from '@/components/appointments/loading'

export default function AppointmentsPage() {
  return (
    <DashboardShell>
      <DashboardHeader />
      <Suspense fallback={<AppointmentsSkeleton />}>
        <CalendarView />
      </Suspense>
    </DashboardShell>
  )
}