"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InvoiceList } from './invoice-list'
import { PaymentList } from './payment-list'
import { InsuranceList } from './insurance-list'
import { PaymentPlanList } from './payment-plan-list'
import { FinancialReports } from './financial-reports'
import { POSTerminal } from './pos-terminal'

export function BillingTabs() {
  const [activeTab, setActiveTab] = useState('invoices')

  return (
    <Tabs defaultValue="invoices" className="space-y-4" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="pos">POS Terminal</TabsTrigger>
        <TabsTrigger value="insurance">Insurance</TabsTrigger>
        <TabsTrigger value="payment-plans">Payment Plans</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="invoices">
        <InvoiceList />
      </TabsContent>

      <TabsContent value="payments">
        <PaymentList />
      </TabsContent>

      {/* <TabsContent value="pos">
        <POSTerminal />
      </TabsContent> */}

      <TabsContent value="insurance">
        <InsuranceList />
      </TabsContent>

      <TabsContent value="payment-plans">
        <PaymentPlanList />
      </TabsContent>

      <TabsContent value="reports">
        <FinancialReports />
      </TabsContent>
    </Tabs>
  )
}