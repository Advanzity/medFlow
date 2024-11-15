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
import { TransactionStatus } from '@/types/billing'
import { format } from 'date-fns'
import { Search, CreditCard, Receipt } from 'lucide-react'
import { ProcessPaymentDialog } from './process-payment-dialog'

export function PaymentList() {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const { selectedClinic } = useClinicStore()

  const loadPayments = async () => {
    // In a real app, this would fetch payments from the server
    setIsLoading(false)
  }

  useEffect(() => {
    if (selectedClinic) {
      loadPayments()
    }
  }, [selectedClinic])

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'bg-yellow-500'
      case TransactionStatus.COMPLETED:
        return 'bg-green-500'
      case TransactionStatus.FAILED:
        return 'bg-red-500'
      case TransactionStatus.REFUNDED:
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!selectedClinic) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Please select a clinic to view payments
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
              placeholder="Search payments..."
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <Button onClick={() => setShowPaymentDialog(true)}>
          <CreditCard className="h-4 w-4 mr-2" />
          Process Payment
        </Button>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.reference}
                    </TableCell>
                    <TableCell>{payment.invoiceNumber}</TableCell>
                    <TableCell>{payment.patientName}</TableCell>
                    <TableCell>
                      {format(new Date(payment.createdAt), 'PPp')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="capitalize">{payment.method.type}</span>
                        <span className="text-muted-foreground">
                          •••• {payment.method.last4}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      ${payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`${getStatusColor(payment.status)} text-white border-0`}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`/receipts/${payment.id}`, '_blank')}
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ProcessPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        onSuccess={() => {
          setShowPaymentDialog(false)
          loadPayments()
        }}
      />
    </div>
  )
}