"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { type Appointment, AppointmentStatus } from "@/types/appointments"
import { appointmentTypes } from "@/lib/appointment-types"

// In-memory storage for mock data
// Store appointments per clinic
const mockAppointments: Map<string, Appointment[]> = new Map()

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  patientName: z.string().min(1, "Patient name is required"),
  clinicId: z.string().min(1, "Clinic ID is required"),
  appointmentType: z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    duration: z.number(),
    defaultPrice: z.number(),
    requiredResources: z.array(z.string()),
    description: z.string(),
    preparationInstructions: z.string().optional(),
  }),
  startTime: z.date(),
  endTime: z.date(),
  status: z.nativeEnum(AppointmentStatus),
  assignedVet: z.string(),
  roomNumber: z.string().optional(),
  notes: z.string(),
  reasonForVisit: z.string(),
  requiredEquipment: z.array(z.string()).optional(),
  followupRequired: z.boolean().optional(),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

export async function createAppointment(data: AppointmentFormData) {
  try {
    const validated = appointmentSchema.parse(data)
    const clinicId = validated.clinicId

    if (!mockAppointments.has(clinicId)) {
      mockAppointments.set(clinicId, [])
    }
    if (!validated.clinicId) {
      return { success: false, error: "Clinic ID is required" }
    }
    
    const appointment: Appointment = {
      id: crypto.randomUUID(),
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockAppointments.get(clinicId)!.push(appointment)
    return { success: true, data: appointment }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }

    console.log(error)
    return { success: false, error: "Failed to create appointment" }
  }
}

export async function updateAppointment(id: string, data: Partial<AppointmentFormData>) {
  try {
    if (!data.clinicId) {
      return { success: false, error: "Clinic ID is required" }
    }

    const clinicAppointments = mockAppointments.get(data.clinicId) || []
    const appointmentIndex = clinicAppointments.findIndex(apt => apt.id === id)

    if (appointmentIndex === -1) {
      return { success: false, error: "Appointment not found" }
    }

    const partialSchema = appointmentSchema.partial()
    const validated = partialSchema.parse(data)

    clinicAppointments[appointmentIndex] = {
      ...clinicAppointments[appointmentIndex],
      ...validated,
      updatedAt: new Date()
    }

    revalidatePath("/dashboard/appointments")
    return { success: true, data: mockAppointments[appointmentIndex] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to update appointment" }
  }
}

export async function deleteAppointment(id: string, clinicId: string) {
  try {
    if (!clinicId) {
      return { success: false, error: "Clinic ID is required" }
    }

    const clinicAppointments = mockAppointments.get(clinicId) || []
    const initialLength = clinicAppointments.length
    
    const updatedAppointments = clinicAppointments.filter(apt => apt.id !== id)
    mockAppointments.set(clinicId, updatedAppointments)
    
    if (updatedAppointments.length === initialLength) {
      return { success: false, error: "Appointment not found" }
    }

    revalidatePath("/dashboard/appointments")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete appointment" }
  }
}

export async function getAppointments(filters?: {
  startDate?: Date
  endDate?: Date
  status?: AppointmentStatus
  vetId?: string
  patientId?: string
  clinicId?: string
}) {
  try {
    if (!filters?.clinicId) {
      return { success: false, error: "Clinic ID is required" }
    }

    const clinicAppointments = mockAppointments.get(filters.clinicId) || []
    let filtered = [...clinicAppointments]

    if (filters) {
      if (filters.startDate) {
      console.log('Filtered appointments:', filtered)
        filtered = filtered.filter(apt => apt.startTime >= filters.startDate!)
      }
      if (filters.endDate) {
        filtered = filtered.filter(apt => apt.startTime <= filters.endDate!)
      }
      if (filters.status) {
        filtered = filtered.filter(apt => apt.status === filters.status)
      }
      if (filters.vetId) {
        filtered = filtered.filter(apt => apt.assignedVet === filters.vetId)
      }
      if (filters.patientId) {
        filtered = filtered.filter(apt => apt.patientId === filters.patientId)
      }
      if (filters.clinicId) {
        filtered = filtered.filter(apt => apt.clinicId === filters.clinicId)
      }
    }

    return { success: true, data: filtered }
  } catch (error) {
    return { success: false, error: "Failed to fetch appointments" }
  }
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  try {
    const appointmentIndex = mockAppointments.findIndex(apt => apt.id === id)
    if (appointmentIndex === -1) {
      return { success: false, error: "Appointment not found" }
    }

    mockAppointments[appointmentIndex] = {
      ...mockAppointments[appointmentIndex],
      status,
      updatedAt: new Date()
    }

    revalidatePath("/dashboard/appointments")
    return { success: true, data: mockAppointments[appointmentIndex] }
  } catch (error) {
    return { success: false, error: "Failed to update appointment status" }
  }
}

export async function checkScheduleConflicts(data: {
  startTime: Date
  endTime: Date
  vetId: string
  roomNumber?: string
  excludeAppointmentId?: string
  clinicId?: string
}) {
  try {
    const conflicts = mockAppointments.filter(apt => {
      if (apt.id === data.excludeAppointmentId) return false

      const hasTimeConflict = (
        (apt.startTime <= data.startTime && apt.endTime > data.startTime) ||
        (apt.startTime < data.endTime && apt.endTime >= data.endTime) ||
        (data.startTime <= apt.startTime && data.endTime > apt.startTime)
      )

      const hasResourceConflict = (
        apt.assignedVet === data.vetId ||
        (data.roomNumber && apt.roomNumber === data.roomNumber)
      )

      const hasClinicMatch = !data.clinicId || apt.clinicId === data.clinicId

      return hasTimeConflict && hasResourceConflict && hasClinicMatch
    })

    return { 
      success: true, 
      hasConflicts: conflicts.length > 0,
      conflicts 
    }
  } catch (error) {
    return { success: false, error: "Failed to check schedule conflicts" }
  }
}

export async function rescheduleAppointment(id: string, startTime: Date, endTime: Date) {
  try {
    const appointmentIndex = mockAppointments.findIndex(apt => apt.id === id)
    if (appointmentIndex === -1) {
      return { success: false, error: "Appointment not found" }
    }

    // Check for conflicts
    const conflicts = await checkScheduleConflicts({
      startTime,
      endTime,
      vetId: mockAppointments[appointmentIndex].assignedVet,
      roomNumber: mockAppointments[appointmentIndex].roomNumber,
      excludeAppointmentId: id,
      clinicId: mockAppointments[appointmentIndex].clinicId
    })

    if (!conflicts.success) {
      return { success: false, error: "Failed to check conflicts" }
    }

    if (conflicts.hasConflicts) {
      return { success: false, error: "Schedule conflict detected" }
    }

    clinicAppointments[appointmentIndex] = {
      ...clinicAppointments[appointmentIndex],
      startTime,
      endTime,
      updatedAt: new Date()
    }

    mockAppointments.set(clinicId, clinicAppointments)
    return { success: true, data: clinicAppointments[appointmentIndex] }
  } catch (error) {
    return { success: false, error: "Failed to reschedule appointment" }
  }
}

export async function getAppointmentsByDate(date: Date, clinicId?: string) {
  try {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const appointments = mockAppointments.filter(apt => {
      const matchesDate = apt.startTime >= dayStart && apt.startTime <= dayEnd
      const matchesClinic = !clinicId || apt.clinicId === clinicId
      return matchesDate && matchesClinic
    })

    return { success: true, data: appointments }
  } catch (error) {
    return { success: false, error: "Failed to fetch appointments" }
  }
}

export async function getAppointmentById(id: string) {
  try {
    const appointment = mockAppointments.find(apt => apt.id === id)
    if (!appointment) {
      return { success: false, error: "Appointment not found" }
    }

    return { success: true, data: appointment }
  } catch (error) {
    return { success: false, error: "Failed to fetch appointment" }
  }
}

export async function getAppointmentStats(clinicId?: string) {
  try {
    const now = new Date()
    const filtered = clinicId 
      ? mockAppointments.filter(apt => apt.clinicId === clinicId)
      : mockAppointments

    const stats = {
      total: filtered.length,
      upcoming: filtered.filter(apt => apt.startTime > now).length,
      completed: filtered.filter(apt => apt.status === AppointmentStatus.COMPLETED).length,
      cancelled: filtered.filter(apt => apt.status === AppointmentStatus.CANCELLED).length,
      noShow: filtered.filter(apt => apt.status === AppointmentStatus.NO_SHOW).length,
    }

    return { success: true, data: stats }
  } catch (error) {
    return { success: false, error: "Failed to fetch appointment statistics" }
  }
}