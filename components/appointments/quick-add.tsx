"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { appointmentTypes } from '@/lib/appointment-types'
import { createAppointment } from '@/app/actions/appointments'
import { useClinicStore } from '@/hooks/use-clinic'
import { toast } from 'sonner'
import { addMinutes, set } from 'date-fns'
import { AppointmentStatus } from '@/types/appointments'

const formSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  appointmentTypeId: z.string().min(1, "Appointment type is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
  reasonForVisit: z.string().min(1, "Reason for visit is required"),
})

interface QuickAddProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AppointmentQuickAdd({ open, onOpenChange, onSuccess }: QuickAddProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { selectedClinic } = useClinicStore()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      appointmentTypeId: '',
      date: '',
      time: '',
      notes: '',
      reasonForVisit: '',
    }
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!selectedClinic?.id) {
      setError('No clinic selected')
      return
    }

    if (!selectedClinic) {
      toast.error('Please select a clinic first')
      return
    }

    const selectedType = appointmentTypes.find(t => t.id === data.appointmentTypeId)
    if (!selectedType) {
      toast.error('Invalid appointment type')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
  const [hours, minutes] = data.time.split(':').map(Number)
  const startTime = set(new Date(data.date), {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0
  })
  const endTime = addMinutes(startTime, selectedType.duration)

  const appointmentData = {
    patientId: 'temp-id', // In a real app, this would be selected from a list
    patientName: data.patientName,
    clinicId: selectedClinic.id, // Add clinicId here
    appointmentType: selectedType,
    startTime,
    endTime,
    status: AppointmentStatus.SCHEDULED,
    assignedVet: 'Dr. Smith', // In a real app, this would be selected
    notes: data.notes || '',
    reasonForVisit: data.reasonForVisit,
  }

  const result = await createAppointment(appointmentData)
  
  if (!result.success) {
    throw new Error(result.error as string)
  }

  toast.success('Appointment created successfully')
  form.reset()
  onSuccess()
  onOpenChange(false)
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Failed to create appointment'
  setError(errorMessage)
} finally {
  setIsSubmitting(false)
}
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Appointment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter patient name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="appointmentTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.duration} mins)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="reasonForVisit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Visit</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Brief description of the visit" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Any special notes or instructions" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
             <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Schedule'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}