export interface Clinic {
  id: string
  name: string
  address: string
  phone: string
  email: string
}

export interface DailyStats {
  totalVisits: number
  newPatients: number
  revenue: number
  satisfaction: number
  completedAppointments: number
  canceledAppointments: number
}

export interface Appointment {
  id: string
  patientName: string
  patientId: string
  dateTime: string
  type: 'Checkup' | 'Follow-up' | 'Consultation' | 'Treatment'
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Canceled'
  duration: number
  notes?: string
}

export interface PatientActivity {
  id: string
  patientId: string
  patientName: string
  type: 'Visit' | 'Payment' | 'Prescription' | 'Test' | 'Booking'
  description: string
  timestamp: string
}

export interface StaffMember {
  id: string
  name: string
  role: 'Doctor' | 'Nurse' | 'Receptionist' | 'Specialist'
  status: 'Available' | 'Busy' | 'Off' | 'Break'
  avatar: string
  nextAvailable?: string
}

export interface MetricCard {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'neutral'
  description: string
}