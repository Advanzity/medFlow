"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MainNav } from '@/components/dashboard/main-nav'
import { DashboardNav } from '@/components/dashboard/nav'
import { UserNav } from '@/components/dashboard/user-nav'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <MainNav className="ml-4" />
          <div className="ml-auto flex items-center gap-2 md:gap-4 mr-4">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <div className="flex-1 items-start md:grid md:grid-cols-[240px_1fr]">
        {/* Sidebar Navigation */}
        <aside
          className={cn("fixed top-14 z-30 -ml-[240px] h-[calc(100vh-3.5rem)] w-[240px] shrink-0 overflow-y-auto border-r bg-background md:sticky md:ml-0 transition-transform duration-200",
            showMobileSidebar && "translate-x-[240px]"
          )}
        >
          <DashboardNav />
        </aside>

        {/* Main Content */}
        <main className="flex w-full flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}