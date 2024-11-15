import { z } from "zod"

export interface Invoice {
  id: string
  patientId: string
  clinicId: string
  number: string
  date: Date
  dueDate: Date
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  status: InvoiceStatus
  paymentStatus: PaymentStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  serviceId?: string
  taxable: boolean
}

export interface Payment {
  id: string
  invoiceId: string
  patientId: string
  amount: number
  method: PaymentMethod
  status: TransactionStatus
  reference: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface PaymentMethod {
  id: string
  patientId: string
  type: 'card' | 'ach' | 'wallet'
  last4: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  metadata?: Record<string, any>
}

export interface InsuranceClaim {
  id: string
  patientId: string
  invoiceId: string
  provider: string
  policyNumber: string
  status: ClaimStatus
  submittedAt: Date
  processedAt?: Date
  amount: number
  approvedAmount?: number
  denialReason?: string
  eobDocument?: string
}

export interface PaymentPlan {
  id: string
  patientId: string
  invoiceId: string
  totalAmount: number
  installments: number
  frequency: 'weekly' | 'monthly'
  startDate: Date
  nextDueDate: Date
  status: PaymentPlanStatus
  payments: Payment[]
}

export interface FinancialReport {
  period: {
    start: Date
    end: Date
  }
  revenue: {
    total: number
    byService: Record<string, number>
    byPaymentMethod: Record<string, number>
  }
  collections: {
    total: number
    outstanding: number
    overdue: number
  }
  insurance: {
    claimed: number
    received: number
    pending: number
    denied: number
  }
  aging: {
    '0-30': number
    '31-60': number
    '61-90': number
    '90+': number
  }
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  VOID = 'void',
  OVERDUE = 'overdue'
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  DENIED = 'denied',
  APPEALED = 'appealed'
}

export enum PaymentPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  CANCELLED = 'cancelled'
}

// Validation Schemas
export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  taxable: z.boolean(),
  serviceId: z.string().optional()
})

export const invoiceSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  clinicId: z.string().min(1, "Clinic ID is required"),
  date: z.date(),
  dueDate: z.date(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional()
})

export const paymentMethodSchema = z.object({
  type: z.enum(['card', 'ach', 'wallet']),
  cardNumber: z.string().optional(),
  expiryMonth: z.number().optional(),
  expiryYear: z.number().optional(),
  cvv: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  walletType: z.string().optional()
})

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethodId: z.string().min(1, "Payment method is required")
})

export const insuranceClaimSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  invoiceId: z.string().min(1, "Invoice ID is required"),
  provider: z.string().min(1, "Provider is required"),
  policyNumber: z.string().min(1, "Policy number is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0")
})

export const paymentPlanSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  installments: z.number().min(2, "Minimum 2 installments required"),
  frequency: z.enum(['weekly', 'monthly']),
  startDate: z.date()
})