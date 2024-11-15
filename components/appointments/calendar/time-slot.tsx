"use client"

import { format } from 'date-fns'
import { Appointment } from '@/types/appointments'
import { AppointmentCard } from './appointment-card'

interface TimeSlotProps {
  time: Date
  appointments: Appointment[]
}

export function TimeSlot({ time, appointments }: TimeSlotProps) {
  return (
    <div 
      className="h-20 border p-1 relative group hover:bg-accent/50 transition-colors"
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