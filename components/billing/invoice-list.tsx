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
import { getInvoice, updateInvoiceStatus } from '@/app/actions/billing'
import { InvoiceStatus, PaymentStatus } from '@/types/billing'
import { format } from 'date-fns'
import { Plus, Search, FileText, Send } from 'lucide-react'
import { toast } from 'sonner'
import { CreateInvoiceDialog } from './create-invoice-dialog'

export function InvoiceList() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { selectedClinic } = useClinicStore()

  const loadInvoices = async () => {
    // In a real app, this would fetch invoices from the server
    setIsLoading(false)
  }

  useEffect(() => {
    if (selectedClinic) {
      loadInvoices()
    }
  }, [selectedClinic])

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    loadInvoices()
    toast.success('Invoice created successfully')
  }

  const handleSendInvoice = async (id: string) => {
    try {
      const result = await updateInvoiceStatus(id, InvoiceStatus.SENT)
      if (result.success) {
        toast.success('Invoice sent successfully')
        loadInvoices()
      } else {
        toast.error(result.error as string)
      }
    } catch (error) {
      toast.error('Failed to send invoice')
    }
  }

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'bg-gray-500'
      case InvoiceStatus.SENT:
        return 'bg-blue-500'
      case InvoiceStatus.PAID:
        return 'bg-green-500'
      case InvoiceStatus.VOID:
        return 'bg-red-500'
      case InvoiceStatus.OVERDUE:
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.UNPAID:
        return 'bg-red-500'
      case PaymentStatus.PARTIAL:
        return 'bg-yellow-500'
      case PaymentStatus.PAID:
        return 'bg-green-500'
      case PaymentStatus.REFUNDED:
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!selectedClinic) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Please select a clinic to view invoices
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
              placeholder="Search invoices..."
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.number}
                    </TableCell>
                    <TableCell>{invoice.patientName}</TableCell>
                    <TableCell>
                      {format(new Date(invoice.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      ${invoice.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`${getStatusColor(invoice.status)} text-white border-0`}
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`${getPaymentStatusColor(invoice.paymentStatus)} text-white border-0`}
                      >
                        {invoice.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`/invoices/${invoice.id}`, '_blank')}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {invoice.status === InvoiceStatus.DRAFT && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSendInvoice(invoice.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreateInvoiceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
