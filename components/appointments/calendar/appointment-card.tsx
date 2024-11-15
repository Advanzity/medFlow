"use client"

import { useDrag } from 'react-dnd'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { AppointmentStatus } from '@/types/appointments'

interface AppointmentCardProps {
  appointment: any
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'appointment',
    item: { id: appointment.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }))

  const statusColors = {
    [AppointmentStatus.SCHEDULED]: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
    [AppointmentStatus.CONFIRMED]: 'border-green-500 bg-green-50 dark:bg-green-950',
    [AppointmentStatus.COMPLETED]: 'border-gray-500 bg-gray-50 dark:bg-gray-950',
    [AppointmentStatus.CANCELLED]: 'border-red-500 bg-red-50 dark:bg-red-950',
    [AppointmentStatus.CHECKED_IN]: 'border-purple-500 bg-purple-50 dark:bg-purple-950',
    [AppointmentStatus.IN_PROGRESS]: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    [AppointmentStatus.NO_SHOW]: 'border-orange-500 bg-orange-50 dark:bg-orange-950'
  }

  return (
    <Card
      ref={drag}
      className={cn(
        "p-2 cursor-move border-l-4 text-sm h-full w-full",
        statusColors[appointment.status],
        isDragging && "opacity-50"
      )}
    >
      <div className="font-medium truncate">{appointment.patientName}</div>
      <div className="text-xs text-muted-foreground">
        {format(new Date(appointment.startTime), 'HH:mm')} - {appointment.appointmentType.name}
      </div>
    </Card>
  )
}