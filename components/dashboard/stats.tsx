"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDailyStats } from '@/app/actions/dashboard'
import { Users, DollarSign, Calendar, Star } from 'lucide-react'
import { useClinicStore } from '@/hooks/use-clinic'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardStats() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { selectedClinic } = useClinicStore()

  useEffect(() => {
    async function loadStats() {
      if (!selectedClinic?.id) return

      try {
        const result = await getDailyStats(selectedClinic.id)
        if (result.success) {
          setStats(result.data)
        } else {
          toast.error('Failed to load statistics')
        }
      } catch (error) {
        toast.error('Error loading statistics')
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
    // Refresh stats every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedClinic])

  if (!selectedClinic) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Please select a clinic to view statistics
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-2" />
              <Skeleton className="h-4 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVisits}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.newPatients} new patients
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.revenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            +12% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedAppointments}</div>
          <p className="text-xs text-muted-foreground">
            {stats.canceledAppointments} canceled
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.satisfaction}/5.0</div>
          <p className="text-xs text-muted-foreground">
            Based on patient feedback
          </p>
        </CardContent>
      </Card>
    </div>
  )
}