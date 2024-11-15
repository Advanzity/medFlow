"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { useClinicStore } from '@/hooks/use-clinic'
import { createMedicalRecord } from '@/app/actions/medical-records'
import { toast } from 'sonner'

const formSchema = z.object({
  type: z.enum(["exam", "vaccine", "surgery", "prescription", "lab"]),
  date: z.string().transform(str => new Date(str)),
  notes: z.string().min(1, "Notes are required"),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  followUpDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
})

interface AddRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  petId?: string
}

export function AddRecordDialog({
  open,
  onOpenChange,
  onSuccess,
  petId
}: AddRecordDialogProps) {
  const { selectedClinic } = useClinicStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
      diagnosis: '',
      treatment: '',
    }
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!selectedClinic?.id) {
      toast.error('No clinic selected')
      return
    }

    if (!petId) {
      toast.error('No patient selected')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createMedicalRecord({
        ...data,
        petId,
        clinicId: selectedClinic.id,
        vetId: 'temp-vet-id', // In a real app, this would be the logged-in vet's ID
        attachments: []
      })

      if (result.success) {
        form.reset()
        onSuccess()
      } else {
        toast.error(result.error as string)
      }
    } catch (error) {
      toast.error('Failed to create record')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Medical Record</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Record Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="exam">Examination</SelectItem>
                      <SelectItem value="vaccine">Vaccination</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="lab">Lab Result</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter record notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter diagnosis (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment Plan</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter treatment plan (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="followUpDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
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
                {isSubmitting ? 'Creating...' : 'Create Record'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}