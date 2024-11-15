export type CalendarView = 'day' | 'week' | 'month'

export interface CalendarSettings {
  defaultView: CalendarView
  workingHours: {
    start: string
    end: string
    daysOfWeek: number[]
  }
  slotDuration: number
  emergencySlots: number
}

export interface AppointmentType {
  id: string
  name: string
  color: string
  duration: number
  defaultPrice: number
  requiredResources: string[]
  description: string
  preparationInstructions?: string
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  clinicId?: string
  appointmentType: AppointmentType
  startTime: Date
  endTime: Date
  status: AppointmentStatus
  assignedVet: string
  roomNumber?: string
  notes: string
  reasonForVisit: string
  createdAt: Date
  updatedAt: Date
  checkinTime?: Date
  checkoutTime?: Date
  requiredEquipment?: string[]
  followupRequired?: boolean
}

export interface SchedulingRules {
  minimumNotice: number
  maxAdvanceBooking: number
  overlapAllowed: boolean
  doubleBookingRules: {
    allowedForAppointmentTypes: string[]
    maxConcurrent: number
  }
  bufferTime: number
}