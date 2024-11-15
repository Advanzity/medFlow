import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { PatientList } from '@/components/patients/patient-list'
import { PatientListSkeleton } from '@/components/patients/loading'

export default function PatientsPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <DashboardHeader />
      </div>
      <Suspense fallback={<PatientListSkeleton />}>
        <PatientList />
      </Suspense>
    </DashboardShell>
  )
}