"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { MedicalRecord, Treatment } from "@/types/patients"

// Store records per clinic
const mockMedicalRecords: Map<string, MedicalRecord[]> = new Map()
const mockTreatments: Map<string, Treatment[]> = new Map()

const medicalRecordSchema = z.object({
  petId: z.string().min(1, "Pet ID is required"),
  clinicId: z.string().min(1, "Clinic ID is required"),
  date: z.date(),
  type: z.enum(["exam", "vaccine", "surgery", "prescription", "lab"]),
  notes: z.string(),
  attachments: z.array(z.string()).optional(),
  vetId: z.string(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  followUpDate: z.date().optional()
})

const treatmentSchema = z.object({
  recordId: z.string().min(1, "Record ID is required"),
  clinicId: z.string().min(1, "Clinic ID is required"),
  name: z.string().min(1, "Treatment name is required"),
  status: z.enum(["scheduled", "in-progress", "completed"]),
  instructions: z.string(),
  followUp: z.date().optional(),
  assignedTo: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  priority: z.enum(["low", "medium", "high"])
})

export type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>
export type TreatmentFormData = z.infer<typeof treatmentSchema>

export async function createMedicalRecord(data: MedicalRecordFormData) {
  try {
    const validated = medicalRecordSchema.parse(data)
    
    if (!mockMedicalRecords.has(validated.clinicId)) {
      mockMedicalRecords.set(validated.clinicId, [])
    }

    const record: MedicalRecord = {
      id: crypto.randomUUID(),
      ...validated
    }

    mockMedicalRecords.get(validated.clinicId)!.push(record)
    
    return { success: true, data: record }
  } catch (error) {
    console.error('Error creating medical record:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to create medical record" }
  }
}

export async function updateMedicalRecord(id: string, data: Partial<MedicalRecordFormData>) {
  try {
    if (!data.clinicId) {
      return { success: false, error: "Clinic ID is required" }
    }

    const clinicRecords = mockMedicalRecords.get(data.clinicId) || []
    const recordIndex = clinicRecords.findIndex(record => record.id === id)
    
    if (recordIndex === -1) {
      return { success: false, error: "Record not found" }
    }

    const partialSchema = medicalRecordSchema.partial()
    const validated = partialSchema.parse(data)

    clinicRecords[recordIndex] = {
      ...clinicRecords[recordIndex],
      ...validated
    }

    mockMedicalRecords.set(data.clinicId, clinicRecords)
    
    return { success: true, data: clinicRecords[recordIndex] }
  } catch (error) {
    console.error('Error updating medical record:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to update medical record" }
  }
}

export async function getMedicalRecords(params: {
  clinicId: string
  petId?: string
  vetId?: string
  type?: MedicalRecord['type']
  dateRange?: { start: Date; end: Date }
}) {
  try {
    const { clinicId, petId, vetId, type, dateRange } = params
    const clinicRecords = mockMedicalRecords.get(clinicId) || []
    
    let filtered = [...clinicRecords]

    if (petId) {
      filtered = filtered.filter(record => record.petId === petId)
    }

    if (vetId) {
      filtered = filtered.filter(record => record.vetId === vetId)
    }

    if (type) {
      filtered = filtered.filter(record => record.type === type)
    }

    if (dateRange) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= dateRange.start && recordDate <= dateRange.end
      })
    }

    return { 
      success: true, 
      data: filtered.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }
  } catch (error) {
    console.error('Error getting medical records:', error)
    return { success: false, error: "Failed to fetch medical records" }
  }
}

export async function createTreatment(data: TreatmentFormData) {
  try {
    const validated = treatmentSchema.parse(data)
    
    if (!mockTreatments.has(validated.clinicId)) {
      mockTreatments.set(validated.clinicId, [])
    }

    const treatment: Treatment = {
      id: crypto.randomUUID(),
      ...validated
    }

    mockTreatments.get(validated.clinicId)!.push(treatment)
    
    return { success: true, data: treatment }
  } catch (error) {
    console.error('Error creating treatment:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to create treatment" }
  }
}

export async function updateTreatmentStatus(
  id: string, 
  clinicId: string, 
  status: Treatment['status']
) {
  try {
    const clinicTreatments = mockTreatments.get(clinicId) || []
    const treatmentIndex = clinicTreatments.findIndex(t => t.id === id)
    
    if (treatmentIndex === -1) {
      return { success: false, error: "Treatment not found" }
    }

    clinicTreatments[treatmentIndex] = {
      ...clinicTreatments[treatmentIndex],
      status,
      endDate: status === 'completed' ? new Date() : undefined
    }

    mockTreatments.set(clinicId, clinicTreatments)
    
    return { success: true, data: clinicTreatments[treatmentIndex] }
  } catch (error) {
    console.error('Error updating treatment status:', error)
    return { success: false, error: "Failed to update treatment status" }
  }
}

export async function getTreatments(params: {
  clinicId: string
  recordId?: string
  status?: Treatment['status']
}) {
  try {
    const { clinicId, recordId, status } = params
    const clinicTreatments = mockTreatments.get(clinicId) || []
    
    let filtered = [...clinicTreatments]

    if (recordId) {
      filtered = filtered.filter(treatment => treatment.recordId === recordId)
    }

    if (status) {
      filtered = filtered.filter(treatment => treatment.status === status)
    }

    return { 
      success: true, 
      data: filtered.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
    }
  } catch (error) {
    console.error('Error getting treatments:', error)
    return { success: false, error: "Failed to fetch treatments" }
  }
}