"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PracticeSettings } from "./sections/practice-settings"
import { OperationalSettings } from "./sections/operational-settings"
import { StaffSettings } from "./sections/staff-settings"
import { CommunicationSettings } from "./sections/communication-settings"
import { FinancialSettings } from "./sections/financial-settings"

export function SettingsTabs() {
  return (
    <Tabs defaultValue="practice" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-4">
        <TabsTrigger value="practice">Practice</TabsTrigger>
        <TabsTrigger value="operational">Operations</TabsTrigger>
        <TabsTrigger value="staff">Staff</TabsTrigger>
        <TabsTrigger value="communication">Communication</TabsTrigger>
        <TabsTrigger value="financial">Financial</TabsTrigger>
      </TabsList>
      <TabsContent value="practice" className="space-y-4">
        <PracticeSettings />
      </TabsContent>
      <TabsContent value="operational" className="space-y-4">
        <OperationalSettings />
      </TabsContent>
      <TabsContent value="staff" className="space-y-4">
        <StaffSettings />
      </TabsContent>
      <TabsContent value="communication" className="space-y-4">
        <CommunicationSettings />
      </TabsContent>
      <TabsContent value="financial" className="space-y-4">
        <FinancialSettings />
      </TabsContent>
    </Tabs>
  )
}