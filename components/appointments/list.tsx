"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { updateAppointmentStatus } from '@/app/actions/appointments'
import { AppointmentStatus } from '@/types/appointments'
import { toast } from 'sonner'

interface AppointmentListProps {
  appointments: any[]
  onStatusChange: () => void
}

export function AppointmentList({ appointments, onStatusChange }: AppointmentListProps) {
  const handleStatusUpdate = async (id: string, status: AppointmentStatus) => {
    const result = await updateAppointmentStatus(id, status)
    if (result.success) {
      toast.success('Appointment status updated')
      onStatusChange()
    } else {
      toast.error(result.error || 'Failed to update status')
    }
  }

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Upcoming Appointments</h3>
      {sortedAppointments.map((appointment) => (
        <Card key={appointment.id} className="bg-muted/50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{appointment.patientName}</span>
                <Badge variant="outline">{appointment.appointmentType.name}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(appointment.startTime), 'PPp')}
              </div>
              {appointment.notes && (
                <p className="text-sm text-muted-foreground">{appointment.notes}</p>
              )}
              <div className="flex gap-2 mt-2">
                {appointment.status !== AppointmentStatus.CONFIRMED && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(appointment.id, AppointmentStatus.CONFIRMED)}
                  >
                    Confirm
                  </Button>
                )}
                {appointment.status === AppointmentStatus.CONFIRMED && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(appointment.id, AppointmentStatus.CHECKED_IN)}
                  >
                    Check In
                  </Button>
                )}
                {appointment.status !== AppointmentStatus.CANCELLED && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => handleStatusUpdate(appointment.id, AppointmentStatus.CANCELLED)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}