"use client"

import { Appointment } from '@/types/appointments'
import { AppointmentCard } from './appointment-card'
import { useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'

interface TimeSlotProps {
  time: Date
  appointments: Appointment[]
}

export function TimeSlot({ time, appointments }: TimeSlotProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'appointment',
    canDrop: () => appointments.length === 0, // Only allow drop if slot is empty
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  }))

  return (
    <div 
      ref={drop}
      className={cn(
        "h-20 border p-1 relative group transition-colors",
        isOver && canDrop && "bg-primary/10",
        !canDrop && appointments.length > 0 && "bg-muted/50",
        canDrop && "hover:bg-accent/50"
      )}
      data-time={time.toISOString()}
    >
      <div className="flex gap-2 h-full">
        {appointments.map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
          />
        ))}
      </div>
    </div>
  )
}