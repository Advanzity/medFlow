import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { BillingTabs } from '@/components/billing/billing-tabs'
import { BillingSkeleton } from '@/components/billing/loading'

export default function BillingPage() {
  return (
    <DashboardShell>
      <DashboardHeader />
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing & Payments</h2>
          <p className="text-muted-foreground">
            Manage invoices, payments, and financial reports
          </p>
        </div>
        <Suspense fallback={<BillingSkeleton />}>
          <BillingTabs />
        </Suspense>
      </div>
    </DashboardShell>
  )
}