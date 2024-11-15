"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useClinicStore } from '@/hooks/use-clinic'
import { PaymentPlanStatus } from '@/types/billing'
import { format } from 'date-fns'
import { Search, Plus, Calendar } from 'lucide-react'
import { CreatePaymentPlanDialog } from './create-payment-plan-dialog'

export function PaymentPlanList() {
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { selectedClinic } = useClinicStore()

  const loadPlans = async () => {
    // In a real app, this would fetch payment plans from the server
    setIsLoading(false)
  }

  useEffect(() => {
    if (selectedClinic) {
      loadPlans()
    }
  }, [selectedClinic])

  const getStatusColor = (status: PaymentPlanStatus) => {
    switch (status) {
      case PaymentPlanStatus.ACTIVE:
        return 'bg-green-500'
      case PaymentPlanStatus.COMPLETED:
        return 'bg-blue-500'
      case PaymentPlanStatus.DEFAULTED:
        return 'bg-red-500'
      case PaymentPlanStatus.CANCELLED:
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!selectedClinic) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Please select a clinic to view payment plans
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payment plans..."
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Installments</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading payment plans...
                  </TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No payment plans found
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.id}
                    </TableCell>
                    <TableCell>{plan.patientName}</TableCell>
                    <TableCell>
                      ${plan.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {plan.payments.length} of {plan.installments}
                    </TableCell>
                    <TableCell>
                      {format(new Date(plan.nextDueDate), 'PP')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`${getStatusColor(plan.status)} text-white border-0`}
                      >
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`/payment-plans/${plan.id}`, '_blank')}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreatePaymentPlanDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false)
          loadPlans()
        }}
      />
    </div>
  )
}