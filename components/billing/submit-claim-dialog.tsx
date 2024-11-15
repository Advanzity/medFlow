"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useClinicStore } from '@/hooks/use-clinic'
import { submitClaim } from '@/app/actions/billing'
import { insuranceClaimSchema } from '@/types/billing'
import { toast } from 'sonner'

interface SubmitClaimDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SubmitClaimDialog({
  open,
  onOpenChange,
  onSuccess
}: SubmitClaimDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { selectedClinic } = useClinicStore()

  const form = useForm({
    resolver: zodResolver(insuranceClaimSchema),
    defaultValues: {
      patientId: '',
      invoiceId: '',
      provider: '',
      policyNumber: '',
      amount: 0
    }
  })

  async function onSubmit(data: any) {
    if (!selectedClinic) {
      toast.error('No clinic selected')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitClaim(data)

      if (result.success) {
        form.reset()
        onSuccess()
      } else {
        toast.error(result.error as string)
      }
    } catch (error) {
      toast.error('Failed to submit claim')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Insurance Claim</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Select patient" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Select invoice" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Provider</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter provider name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="policyNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter policy number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Claim Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
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
                {isSubmitting ? "Submitting..." : "Submit Claim"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}