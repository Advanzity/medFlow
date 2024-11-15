export interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  dob: Date
  weight: number
  ownerId: string
  microchipId?: string
  status: 'active' | 'deceased' | 'archived'
  lastVisit?: Date
  nextAppointment?: Date
}

export interface MedicalRecord {
  id: string
  petId: string
  date: Date
  type: 'exam' | 'vaccine' | 'surgery' | 'prescription' | 'lab'
  notes: string
  attachments?: string[]
  vetId: string
  diagnosis?: string
  treatment?: string
  followUpDate?: Date
}

export interface Treatment {
  id: string
  recordId: string
  name: string
  status: 'scheduled' | 'in-progress' | 'completed'
  instructions: string
  followUp?: Date
  assignedTo?: string
  startDate: Date
  endDate?: Date
  priority: 'low' | 'medium' | 'high'
}

export interface SearchFilters {
  status?: Pet['status'][]
  species?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  vetId?: string
}