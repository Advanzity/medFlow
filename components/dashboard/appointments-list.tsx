"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAppointments } from '@/app/actions/appointments'
import { format, addDays } from 'date-fns'
import { useClinicStore } from '@/hooks/use-clinic'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { AppointmentStatus } from '@/types/appointments'

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { selectedClinic } = useClinicStore()

  useEffect(() => {
    async function loadAppointments() {
      if (!selectedClinic?.id) return

      try {
        const result = await getAppointments({
          clinicId: selectedClinic.id,
          startDate: new Date(),
          endDate: addDays(new Date(), 7), // Get next 7 days
          status: AppointmentStatus.SCHEDULED
        })

        if (result.success) {
          // Sort by date and take first 5
          const sorted = (result.data || [])
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 5)
          setAppointments(sorted)
        } else {
          toast.error('Failed to load appointments')
        }
      } catch (error) {
        toast.error('Error loading appointments')
      } finally {
        setIsLoading(false)
      }
    }

    loadAppointments()
    // Refresh appointments every 2 minutes
    const interval = setInterval(loadAppointments, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedClinic])

  if (!selectedClinic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Please select a clinic to view appointments
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-[80px]" />
                  <Skeleton className="h-6 w-[80px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-500'
      case AppointmentStatus.SCHEDULED:
        return 'bg-blue-500'
      case AppointmentStatus.CANCELLED:
        return 'bg-red-500'
      case AppointmentStatus.COMPLETED:
        return 'bg-gray-500'
      case AppointmentStatus.CHECKED_IN:
        return 'bg-purple-500'
      case AppointmentStatus.IN_PROGRESS:
        return 'bg-yellow-500'
      case AppointmentStatus.NO_SHOW:
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No upcoming appointments
            </div>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex flex-col space-y-1">
                  <p className="font-medium">{appointment.patientName}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(appointment.startTime), 'PPp')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({appointment.appointmentType.duration} mins)
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {appointment.appointmentType.name}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(appointment.status)} text-white border-0`}
                  >
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}