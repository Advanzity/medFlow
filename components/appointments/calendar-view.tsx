"use client"

import { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { useClinicStore } from '@/hooks/use-clinic'
import { AppointmentQuickAdd } from './quick-add'
import { AppointmentList } from './list'
import { TimeGrid } from './calendar/time-grid'
import { ResourceList } from './calendar/resource-list'
import { getAppointments, rescheduleAppointment } from '@/app/actions/appointments'
import { toast } from 'sonner'

export function CalendarView() {
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { selectedClinic } = useClinicStore()

  const loadAppointments = async () => {
    if (!selectedClinic?.id) {
      console.log("No clinic selected - skipping appointment load")
      return
    }

    setIsLoading(true)
    try {
      let startDate, endDate
      
      switch (view) {
        case 'day':
          startDate = date
          endDate = date
          break
        case 'week':
          startDate = startOfWeek(date, { weekStartsOn: 1 })
          endDate = endOfWeek(date, { weekStartsOn: 1 })
          break
        case 'month':
          startDate = startOfWeek(date, { weekStartsOn: 1 })
          endDate = endOfWeek(date, { weekStartsOn: 1 })
          break
      }
      
      console.log('Fetching appointments with params:', {
        startDate,
        endDate,
        clinicId: selectedClinic.id
      })

      const result = await getAppointments({
        startDate,
        endDate,
        clinicId: selectedClinic.id
      })

      if (result.success) {
        console.log('Appointments loaded:', result.data)
        setAppointments(result.data)
      } else {
        console.error('Failed to load appointments:', result.error)
        toast.error("Failed to load appointments: " + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error in loadAppointments:', error)
      toast.error("Error loading appointments: " + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedClinic) {
      loadAppointments()
    }
  }, [date, view, selectedClinic])

  const handleDateChange = (increment: number) => {
    const newDate = new Date(date)
    switch (view) {
      case 'day':
        newDate.setDate(date.getDate() + increment)
        break
      case 'week':
        newDate.setDate(date.getDate() + (increment * 7))
        break
      case 'month':
        newDate.setMonth(date.getMonth() + increment)
        break
    }
    setDate(newDate)
  }

  const handleAppointmentMove = async (id: string, newTime: Date) => {
    const appointment = appointments.find(apt => apt.id === id)
    if (!appointment) {
      toast.error('Appointment not found')
      return
    }

    const duration = new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()
    const newEndTime = new Date(newTime.getTime() + duration)

    try {
      console.log('Rescheduling appointment:', { id, newTime, newEndTime })
      const result = await rescheduleAppointment(id, newTime, newEndTime)
      
      if (result.success) {
        toast.success('Appointment rescheduled')
        await loadAppointments()
      } else {
        console.error('Failed to reschedule:', result.error)
        toast.error(result.error || 'Failed to reschedule appointment')
      }
    } catch (error) {
      console.error('Error in handleAppointmentMove:', error)
      toast.error('Error rescheduling appointment')
    }
  }

  const handleQuickAddSuccess = async () => {
    console.log('Quick add success - reloading appointments for clinic:', selectedClinic?.id)
    setShowQuickAdd(false)
    await loadAppointments()
    toast.success('Calendar updated with new appointment')
  }

  const getDateRangeText = () => {
    switch (view) {
      case 'day':
        return format(date, 'MMMM d, yyyy')
      case 'week': {
        const start = startOfWeek(date, { weekStartsOn: 1 })
        const end = endOfWeek(date, { weekStartsOn: 1 })
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
      }
      case 'month':
        return format(date, 'MMMM yyyy')
    }
  }

  if (!selectedClinic) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p className="text-gray-500">Please select a clinic to view the calendar</p>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button 
            onClick={() => setShowQuickAdd(true)}
            disabled={!selectedClinic}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week' | 'month')} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleDateChange(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[200px] text-center">
                {getDateRangeText()}
              </span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleDateChange(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-9">
              <Card className="p-4">
                <TimeGrid
                  date={date}
                  view={view}
                  appointments={appointments}
                  onAppointmentMove={handleAppointmentMove}
                  isLoading={isLoading}
                />
              </Card>
            </div>

            <div className="md:col-span-3 space-y-4">
              <ResourceList
                resources={[
                  { id: '1', name: 'Exam Room 1', type: 'room', status: 'available' },
                  { id: '2', name: 'X-Ray Machine', type: 'equipment', status: 'busy' },
                  { id: '3', name: 'Dr. Smith', type: 'staff', status: 'available' },
                ]}
                onResourceSelect={(resource) => {
                  toast.info(`Selected ${resource.name}`)
                }}
              />
              <AppointmentList 
                appointments={appointments.filter(apt => 
                  new Date(apt.startTime) >= new Date()
                ).slice(0, 5)} 
                onStatusChange={loadAppointments}
              />
            </div>
          </div>
        </Tabs>

        <AppointmentQuickAdd
          open={showQuickAdd}
          onOpenChange={setShowQuickAdd}
          onSuccess={handleQuickAddSuccess}
        />
      </div>
    </DndProvider>
  )
}