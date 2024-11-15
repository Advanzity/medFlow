"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import {
  Invoice,
  Payment,
  PaymentMethod,
  InsuranceClaim,
  PaymentPlan,
  FinancialReport,
  InvoiceStatus,
  PaymentStatus,
  TransactionStatus,
  ClaimStatus,
  PaymentPlanStatus,
  invoiceSchema,
  paymentSchema,
  paymentMethodSchema,
  insuranceClaimSchema,
  paymentPlanSchema
} from "@/types/billing"

// In-memory storage
const mockInvoices = new Map<string, Invoice>()
const mockPayments = new Map<string, Payment>()
const mockPaymentMethods = new Map<string, PaymentMethod>()
const mockClaims = new Map<string, InsuranceClaim>()
const mockPaymentPlans = new Map<string, PaymentPlan>()

// Helper function to generate invoice numbers
function generateInvoiceNumber(): string {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

// Invoicing
export async function createInvoice(data: z.infer<typeof invoiceSchema>) {
  try {
    const validated = invoiceSchema.parse(data)
    
    const subtotal = validated.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    )
    
    const taxableAmount = validated.items
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    
    const tax = taxableAmount * 0.1 // 10% tax rate
    
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      number: generateInvoiceNumber(),
      ...validated,
      items: validated.items.map(item => ({
        id: crypto.randomUUID(),
        ...item,
        total: item.quantity * item.unitPrice
      })),
      subtotal,
      tax,
      total: subtotal + tax,
      status: InvoiceStatus.DRAFT,
      paymentStatus: PaymentStatus.UNPAID,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockInvoices.set(invoice.id, invoice)
    revalidatePath("/dashboard/billing")
    
    return { success: true, data: invoice }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to create invoice" }
  }
}

export async function getInvoice(id: string) {
  try {
    const invoice = mockInvoices.get(id)
    if (!invoice) {
      return { success: false, error: "Invoice not found" }
    }
    return { success: true, data: invoice }
  } catch (error) {
    return { success: false, error: "Failed to fetch invoice" }
  }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  try {
    const invoice = mockInvoices.get(id)
    if (!invoice) {
      return { success: false, error: "Invoice not found" }
    }

    invoice.status = status
    invoice.updatedAt = new Date()
    mockInvoices.set(id, invoice)
    
    revalidatePath("/dashboard/billing")
    return { success: true, data: invoice }
  } catch (error) {
    return { success: false, error: "Failed to update invoice status" }
  }
}

// Payments
export async function processPayment(data: z.infer<typeof paymentSchema>) {
  try {
    const validated = paymentSchema.parse(data)
    
    const invoice = mockInvoices.get(validated.invoiceId)
    if (!invoice) {
      return { success: false, error: "Invoice not found" }
    }

    // Simulate payment processing
    const success = Math.random() > 0.1 // 90% success rate
    
    if (!success) {
      return { success: false, error: "Payment processing failed" }
    }

    const payment: Payment = {
      id: crypto.randomUUID(),
      invoiceId: validated.invoiceId,
      patientId: invoice.patientId,
      amount: validated.amount,
      method: mockPaymentMethods.get(validated.paymentMethodId)!,
      status: TransactionStatus.COMPLETED,
      reference: `PAY-${Date.now()}`,
      createdAt: new Date()
    }

    mockPayments.set(payment.id, payment)

    // Update invoice payment status
    const totalPaid = Array.from(mockPayments.values())
      .filter(p => p.invoiceId === invoice.id && p.status === TransactionStatus.COMPLETED)
      .reduce((sum, p) => sum + p.amount, 0)

    invoice.paymentStatus = totalPaid >= invoice.total 
      ? PaymentStatus.PAID 
      : totalPaid > 0 
        ? PaymentStatus.PARTIAL 
        : PaymentStatus.UNPAID

    invoice.status = invoice.paymentStatus === PaymentStatus.PAID 
      ? InvoiceStatus.PAID 
      : invoice.status

    mockInvoices.set(invoice.id, invoice)
    revalidatePath("/dashboard/billing")
    
    return { success: true, data: payment }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to process payment" }
  }
}

export async function addPaymentMethod(
  patientId: string, 
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const validated = paymentMethodSchema.parse(data)
    
    const paymentMethod: PaymentMethod = {
      id: crypto.randomUUID(),
      patientId,
      type: validated.type,
      last4: validated.type === 'card' 
        ? validated.cardNumber!.slice(-4)
        : validated.accountNumber?.slice(-4) || '****',
      expiryMonth: validated.expiryMonth,
      expiryYear: validated.expiryYear,
      isDefault: false,
      metadata: {
        ...validated,
        cardNumber: undefined,
        cvv: undefined
      }
    }

    mockPaymentMethods.set(paymentMethod.id, paymentMethod)
    revalidatePath("/dashboard/billing")
    
    return { success: true, data: paymentMethod }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to add payment method" }
  }
}

// Insurance Claims
export async function submitClaim(data: z.infer<typeof insuranceClaimSchema>) {
  try {
    const validated = insuranceClaimSchema.parse(data)
    
    const claim: InsuranceClaim = {
      id: crypto.randomUUID(),
      ...validated,
      status: ClaimStatus.SUBMITTED,
      submittedAt: new Date()
    }

    mockClaims.set(claim.id, claim)
    revalidatePath("/dashboard/billing")
    
    return { success: true, data: claim }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to submit claim" }
  }
}

export async function updateClaimStatus(
  id: string, 
  status: ClaimStatus,
  data?: {
    approvedAmount?: number
    denialReason?: string
    eobDocument?: string
  }
) {
  try {
    const claim = mockClaims.get(id)
    if (!claim) {
      return { success: false, error: "Claim not found" }
    }

    const updatedClaim = {
      ...claim,
      status,
      ...data,
      processedAt: new Date()
    }

    mockClaims.set(id, updatedClaim)
    revalidatePath("/dashboard/billing")
    
    return { success: true, data: updatedClaim }
  } catch (error) {
    return { success: false, error: "Failed to update claim status" }
  }
}

// Payment Plans
export async function createPaymentPlan(data: z.infer<typeof paymentPlanSchema>) {
  try {
    const validated = paymentPlanSchema.parse(data)
    
    const invoice = mockInvoices.get(validated.invoiceId)
    if (!invoice) {
      return { success: false, error: "Invoice not found" }
    }

    const installmentAmount = Math.ceil(invoice.total / validated.installments)
    
    const plan: PaymentPlan = {
      id: crypto.randomUUID(),
      patientId: invoice.patientId,
      invoiceId: validated.invoiceId,
      totalAmount: invoice.total,
      installments: validated.installments,
      frequency: validated.frequency,
      startDate: validated.startDate,
      nextDueDate: validated.startDate,
      status: PaymentPlanStatus.ACTIVE,
      payments: []
    }

    mockPaymentPlans.set(plan.id, plan)
    revalidatePath("/dashboard/billing")
    
    return { success: true, data: plan }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to create payment plan" }
  }
}

// Financial Reports
export async function generateFinancialReport(
  clinicId: string,
  startDate: Date,
  endDate: Date
): Promise<{ 
  success: boolean
  data?: FinancialReport
  error?: string 
}> {
  try {
    const clinicInvoices = Array.from(mockInvoices.values())
      .filter(invoice => 
        invoice.clinicId === clinicId &&
        invoice.date >= startDate &&
        invoice.date <= endDate
      )

    const clinicPayments = Array.from(mockPayments.values())
      .filter(payment => 
        payment.createdAt >= startDate &&
        payment.createdAt <= endDate &&
        clinicInvoices.some(inv => inv.id === payment.invoiceId)
      )

    const clinicClaims = Array.from(mockClaims.values())
      .filter(claim => 
        claim.submittedAt >= startDate &&
        claim.submittedAt <= endDate &&
        clinicInvoices.some(inv => inv.id === claim.invoiceId)
      )

    // Calculate revenue by service
    const revenueByService = clinicInvoices.reduce((acc, invoice) => {
      invoice.items.forEach(item => {
        if (item.serviceId) {
          acc[item.serviceId] = (acc[item.serviceId] || 0) + item.total
        }
      })
      return acc
    }, {} as Record<string, number>)

    // Calculate revenue by payment method
    const revenueByPaymentMethod = clinicPayments.reduce((acc, payment) => {
      const methodType = payment.method.type
      acc[methodType] = (acc[methodType] || 0) + payment.amount
      return acc
    }, {} as Record<string, number>)

    // Calculate aging buckets
    const now = new Date()
    const aging = clinicInvoices
      .filter(inv => inv.paymentStatus !== PaymentStatus.PAID)
      .reduce((acc, invoice) => {
        const daysOverdue = Math.floor(
          (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (daysOverdue <= 30) acc['0-30'] += invoice.total
        else if (daysOverdue <= 60) acc['31-60'] += invoice.total
        else if (daysOverdue <= 90) acc['61-90'] += invoice.total
        else acc['90+'] += invoice.total
        
        return acc
      }, { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 })

    const report: FinancialReport = {
      period: {
        start: startDate,
        end: endDate
      },
      revenue: {
        total: clinicInvoices.reduce((sum, inv) => sum + inv.total, 0),
        byService: revenueByService,
        byPaymentMethod: revenueByPaymentMethod
      },
      collections: {
        total: clinicPayments.reduce((sum, pay) => sum + pay.amount, 0),
        outstanding: clinicInvoices
          .filter(inv => inv.paymentStatus !== PaymentStatus.PAID)
          .reduce((sum, inv) => sum + inv.total, 0),
        overdue: clinicInvoices
          .filter(inv => 
            inv.paymentStatus !== PaymentStatus.PAID && 
            inv.dueDate < new Date()
          )
          .reduce((sum, inv) => sum + inv.total, 0)
      },
      insurance: {
        claimed: clinicClaims.reduce((sum, claim) => sum + claim.amount, 0),
        received: clinicClaims
          .filter(claim => claim.status === ClaimStatus.APPROVED)
          .reduce((sum, claim) => sum + (claim.approvedAmount || 0), 0),
        pending: clinicClaims
          .filter(claim => 
            claim.status === ClaimStatus.SUBMITTED || 
            claim.status === ClaimStatus.IN_REVIEW
          )
          .reduce((sum, claim) => sum + claim.amount, 0),
        denied: clinicClaims
          .filter(claim => claim.status === ClaimStatus.DENIED)
          .reduce((sum, claim) => sum + claim.amount, 0)
      },
      aging
    }

    return { success: true, data: report }
  } catch (error) {
    console.error('Error generating financial report:', error)
    return { success: false, error: "Failed to generate financial report" }
  }
}