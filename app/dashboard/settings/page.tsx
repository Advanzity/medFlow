import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { SettingsTabs } from '@/components/settings/settings-tabs'
import { SettingsSkeleton } from '@/components/settings/loading'

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader />
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your clinic settings and preferences
          </p>
        </div>
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsTabs />
        </Suspense>
      </div>
    </DashboardShell>
  )
}