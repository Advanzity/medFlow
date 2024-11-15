"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateMockActivities } from '@/lib/mock-data'
import { formatDistanceToNow } from 'date-fns'
import { Activity, FileText, CreditCard, Calendar, Stethoscope } from 'lucide-react'

const activityIcons = {
  Visit: Stethoscope,
  Payment: CreditCard,
  Prescription: FileText,
  Test: Activity,
  Booking: Calendar,
}

export function ActivityFeed() {
  const [activities, setActivities] = useState(generateMockActivities(8))

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(generateMockActivities(8))
    }, 15000)
    return () => clearInterval(interval)
  }, [])

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