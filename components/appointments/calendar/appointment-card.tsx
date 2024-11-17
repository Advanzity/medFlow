"use client"

import { useDrag } from 'react-dnd'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { AppointmentStatus, type Appointment } from '@/types/appointments'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface AppointmentCardProps {
  appointment: Appointment
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  console.log('Rendering appointment:', appointment)

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'appointment',
    item: { id: appointment.id },
    canDrag: appointment.status !== AppointmentStatus.COMPLETED && 
             appointment.status !== AppointmentStatus.CANCELLED &&
             appointment.status !== AppointmentStatus.NO_SHOW,
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

  const canDrag = appointment.status !== AppointmentStatus.COMPLETED && 
                 appointment.status !== AppointmentStatus.CANCELLED &&
                 appointment.status !== AppointmentStatus.NO_SHOW

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            ref={canDrag ? drag : undefined}
            className={cn(
              "p-2 border-l-4 text-sm h-full w-full transition-colors",
              statusColors[appointment.status],
              isDragging && "opacity-50",
              canDrag && "cursor-move hover:bg-accent/50",
              !canDrag && "opacity-75"
            )}
          >
            <div className="font-medium truncate">{appointment.patientName}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>{format(new Date(appointment.startTime), 'HH:mm')}</span>
              <span>•</span>
              <span>{appointment.appointmentType.name}</span>
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" align="start">
          <div className="space-y-1">
            <div className="font-medium">{appointment.patientName}</div>
            <div className="text-xs">
              {format(new Date(appointment.startTime), 'PPp')} ({appointment.appointmentType.duration} mins)
            </div>
            {appointment.reasonForVisit && (
              <div className="text-xs text-muted-foreground">
                Reason: {appointment.reasonForVisit}
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs",
                  statusColors[appointment.status].replace('bg-', 'text-').replace('/50', '/700')
                )}
              >
                {appointment.status}
              </Badge>
              {appointment.assignedVet && (
                <Badge variant="outline" className="text-xs">
                  {appointment.assignedVet}
                </Badge>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}