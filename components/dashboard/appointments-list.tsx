"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { generateMockAppointments } from '@/lib/mock-data'
import { format } from 'date-fns'

export function AppointmentsList() {
  const [appointments, setAppointments] = useState(generateMockAppointments(5))

  useEffect(() => {
    const interval = setInterval(() => {
      setAppointments(generateMockAppointments(5))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex flex-col space-y-1">
                <p className="font-medium">{appointment.patientName}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(appointment.dateTime), 'PPp')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({appointment.duration} mins)
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{appointment.type}</Badge>
                <Badge
                  variant={
                    appointment.status === 'Confirmed'
                      ? 'default'
                      : appointment.status === 'Completed'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {appointment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}