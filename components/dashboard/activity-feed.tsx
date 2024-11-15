"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRecentActivity } from '@/app/actions/dashboard'
import { formatDistanceToNow } from 'date-fns'
import { Activity, FileText, CreditCard, Calendar, Stethoscope } from 'lucide-react'
import { useClinicStore } from '@/hooks/use-clinic'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

const activityIcons = {
  Visit: Stethoscope,
  Payment: CreditCard,
  Prescription: FileText,
  Test: Activity,
  Booking: Calendar,
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { selectedClinic } = useClinicStore()

  useEffect(() => {
    async function loadActivities() {
      if (!selectedClinic?.id) return

      try {
        const result = await getRecentActivity(selectedClinic.id)
        if (result.success) {
          setActivities(result.data || [])
        } else {
          toast.error('Failed to load activity feed')
        }
      } catch (error) {
        toast.error('Error loading activity feed')
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
    // Refresh activities every minute
    const interval = setInterval(loadActivities, 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedClinic])

  if (!selectedClinic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Please select a clinic to view activity
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type]
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3"
              >
                <div className="mt-1">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.patientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}