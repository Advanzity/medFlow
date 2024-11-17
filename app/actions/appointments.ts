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

    // Check for conflicts before creating
    const conflicts = await checkScheduleConflicts({
      startTime: validated.startTime,
      endTime: validated.endTime,
      vetId: validated.assignedVet,
      clinicId: validated.clinicId
    })

    if (conflicts.hasConflicts) {
      return { success: false, error: "Time slot is not available" }
    }

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockAppointments.get(clinicId)!.push(appointment)
    revalidatePath("/dashboard/appointments")
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

    mockAppointments.set(data.clinicId, clinicAppointments)
    revalidatePath("/dashboard/appointments")
    return { success: true, data: clinicAppointments[appointmentIndex] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to update appointment" }
  }
}

export async function checkScheduleConflicts(data: {
  startTime: Date
  endTime: Date
  vetId: string
  roomNumber?: string
  excludeAppointmentId?: string
  clinicId: string
}) {
  try {
    console.log('Checking conflicts for:', data);
    const clinicAppointments = mockAppointments.get(data.clinicId) || [];
    console.log('Current appointments:', clinicAppointments);
    
    const conflicts = clinicAppointments.filter(apt => {
      if (apt.id === data.excludeAppointmentId) return false;

      const hasTimeConflict = (
        (apt.startTime <= data.startTime && apt.endTime > data.startTime) ||
        (apt.startTime < data.endTime && apt.endTime >= data.endTime) ||
        (data.startTime <= apt.startTime && data.endTime > apt.startTime)
      );

      const hasResourceConflict = (
        apt.assignedVet === data.vetId ||
        (data.roomNumber && apt.roomNumber === data.roomNumber)
      );

      const isActive = apt.status !== AppointmentStatus.CANCELLED;

      console.log('Checking appointment:', apt.id, {
        hasTimeConflict,
        hasResourceConflict,
        isActive
      });

      return hasTimeConflict && hasResourceConflict && isActive;
    });

    console.log('Conflicts found:', conflicts);

    return { 
      success: true, 
      hasConflicts: conflicts.length > 0,
      conflicts 
    };
  } catch (error) {
    console.error('Error checking conflicts:', error);
    return { success: false, error: "Failed to check schedule conflicts" };
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
        filtered = filtered.filter(apt => new Date(apt.startTime) >= filters.startDate!)
      }
      if (filters.endDate) {
        filtered = filtered.filter(apt => new Date(apt.startTime) <= filters.endDate!)
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
    }

    // Initialize with some mock data if empty
    // if (filtered.length === 0) {
    //   const mockData = generateMockAppointments(filters.clinicId)
    //   mockAppointments.set(filters.clinicId, mockData)
    //   filtered = mockData
    // }

    return { success: true, data: filtered }
  } catch (error) {
    console.error('Error getting appointments:', error)
    return { success: false, error: "Failed to fetch appointments" }
  }
}

// Helper function to generate mock appointments
function generateMockAppointments(clinicId: string): Appointment[] {
  const startDate = new Date()
  startDate.setHours(9, 0, 0, 0)

  return Array.from({ length: 5 }, (_, i) => {
    const type = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)]
    const start = new Date(startDate)
    start.setHours(start.getHours() + i * 2)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + type.duration)

    return {
      id: `apt-${i}`,
      patientId: `pat-${i}`,
      patientName: `Patient ${i + 1}`,
      clinicId,
      appointmentType: type,
      startTime: start,
      endTime: end,
      status: AppointmentStatus.SCHEDULED,
      assignedVet: 'Dr. Smith',
      notes: 'Mock appointment',
      reasonForVisit: 'Regular checkup',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus, clinicId: string) {
  try {
    const clinicAppointments = mockAppointments.get(clinicId) || []
    const appointmentIndex = clinicAppointments.findIndex(apt => apt.id === id)
    
    if (appointmentIndex === -1) {
      return { success: false, error: "Appointment not found" }
    }

    clinicAppointments[appointmentIndex] = {
      ...clinicAppointments[appointmentIndex],
      status,
      updatedAt: new Date()
    }

    mockAppointments.set(clinicId, clinicAppointments)
    revalidatePath("/dashboard/appointments")
    return { success: true, data: clinicAppointments[appointmentIndex] }
  } catch (error) {
    return { success: false, error: "Failed to update appointment status" }
  }
}

export async function rescheduleAppointment(id: string, startTime: Date, endTime: Date, clinicId: string) {
  try {
    const clinicAppointments = mockAppointments.get(clinicId) || []
    const appointmentIndex = clinicAppointments.findIndex(apt => apt.id === id)
    
    if (appointmentIndex === -1) {
      return { success: false, error: "Appointment not found" }
    }

    // Check for conflicts
    const conflicts = await checkScheduleConflicts({
      startTime,
      endTime,
      vetId: clinicAppointments[appointmentIndex].assignedVet,
      roomNumber: clinicAppointments[appointmentIndex].roomNumber,
      excludeAppointmentId: id,
      clinicId
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
    revalidatePath("/dashboard/appointments")
    return { success: true, data: clinicAppointments[appointmentIndex] }
  } catch (error) {
    return { success: false, error: "Failed to reschedule appointment" }
  }
}