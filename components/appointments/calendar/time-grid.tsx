"use client"

import { format, addMinutes, startOfDay, endOfDay, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'
import { TimeSlot } from './time-slot'
import { Skeleton } from '@/components/ui/skeleton'

interface TimeGridProps {
  date: Date
  view: 'day' | 'week' | 'month'
  appointments: any[]
  onAppointmentMove: (id: string, newTime: Date) => void
  isLoading?: boolean
}

export function TimeGrid({ date, view, appointments, onAppointmentMove, isLoading }: TimeGridProps) {
  const workingHours = {
    start: 8, // 8 AM
    end: 18, // 6 PM
    interval: 30 // 30 minute slots
  }

  const getDaysToShow = () => {
    switch (view) {
      case 'day':
        return [date]
      case 'week':
        const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Start from Monday
        return eachDayOfInterval({
          start: weekStart,
          end: endOfWeek(date, { weekStartsOn: 1 })
        })
      case 'month':
        // For month view, we'll show a simplified week view for now
        // In a real app, you'd implement a proper month calendar
        const monthWeekStart = startOfWeek(date, { weekStartsOn: 1 })
        return eachDayOfInterval({
          start: monthWeekStart,
          end: endOfWeek(date, { weekStartsOn: 1 })
        })
      default:
        return [date]
    }
  }

  const days = getDaysToShow()

  const generateTimeSlots = (day: Date) => {
    const slots = []
    const dayStart = startOfDay(day)
    dayStart.setHours(workingHours.start)

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let min = 0; min < 60; min += workingHours.interval) {
        const slotTime = addMinutes(dayStart, (hour - workingHours.start) * 60 + min)
        slots.push(slotTime)
      }
    }
    return slots
  }

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'appointment',
    drop: (item: { id: string }, monitor) => {
      const offset = monitor.getClientOffset()
      if (offset) {
        const element = document.elementFromPoint(offset.x, offset.y)
        const timeAttr = element?.getAttribute('data-time')
        if (timeAttr) {
          onAppointmentMove(item.id, new Date(timeAttr))
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }))

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with dates */}
        <div className="grid" style={{ gridTemplateColumns: `auto repeat(${days.length}, 1fr)` }}>
          <div className="w-16" /> {/* Time column */}
          {days.map((day) => (
            <div key={day.toISOString()} className="px-2 py-1 text-center border-b">
              <div className="font-medium">{format(day, 'EEE')}</div>
              <div className="text-sm text-muted-foreground">{format(day, 'MMM d')}</div>
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div ref={drop} className={cn("relative", isOver && "bg-accent/50")}>
          {generateTimeSlots(days[0]).map((time) => (
            <div
              key={time.toISOString()}
              className="grid"
              style={{ gridTemplateColumns: `auto repeat(${days.length}, 1fr)` }}
            >
              {/* Time label */}
              <div className="w-16 pr-2 py-2 text-right text-sm text-muted-foreground">
                {format(time, 'HH:mm')}
              </div>

              {/* Slots for each day */}
{days.map((day) => {
  const slotTime = new Date(day)
  slotTime.setHours(time.getHours(), time.getMinutes())
  
  return (
    <TimeSlot
      key={`${day.toISOString()}-${time.toISOString()}`}
      time={slotTime}
      appointments={appointments.filter(apt => {
        const aptStart = new Date(apt.startTime)
        const aptEnd = new Date(apt.endTime)
        
        // Check if slot time falls within appointment time range
        return slotTime >= aptStart && slotTime < aptEnd
      })}
    />
  )
})}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}