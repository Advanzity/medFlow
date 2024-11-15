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
import { SmartScheduler } from './smart-scheduler'

const formSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  appointmentTypeId: z.string().min(1, "Appointment type is required"),
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
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null)
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      appointmentTypeId: '',
      notes: '',
      reasonForVisit: '',
    }
  })

  const handleTimeSlotSelect = (startTime: Date, endTime: Date) => {
    setSelectedStartTime(startTime)
    setSelectedEndTime(endTime)
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!selectedClinic?.id) {
      toast.error('Please select a clinic first')
      return
    }

    if (!selectedStartTime || !selectedEndTime) {
      toast.error('Please select a time slot')
      return
    }

    const selectedType = appointmentTypes.find(t => t.id === data.appointmentTypeId)
    if (!selectedType) {
      toast.error('Invalid appointment type')
      return
    }

    setIsSubmitting(true)

    try {
      const appointmentData = {
        patientId: 'temp-id',
        patientName: data.patientName,
        clinicId: selectedClinic.id,
        appointmentType: selectedType,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        status: AppointmentStatus.SCHEDULED,
        assignedVet: 'Dr. Smith',
        notes: data.notes || '',
        reasonForVisit: data.reasonForVisit,
      }

      const result = await createAppointment(appointmentData)
      console.log(result)
      if (!result.success) {
        throw new Error(result.error as string)
      }

      toast.success('Appointment created successfully')
      form.reset()
      setSelectedStartTime(null)
      setSelectedEndTime(null)
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create appointment'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Appointment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <SmartScheduler onSlotSelect={handleTimeSlotSelect} />
          
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
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedStartTime || !selectedEndTime}
                >
                  {isSubmitting ? 'Creating...' : 'Schedule'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}