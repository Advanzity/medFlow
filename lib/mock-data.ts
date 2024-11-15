import { 
  Clinic, 
  DailyStats, 
  Appointment, 
  PatientActivity, 
  StaffMember,
  MetricCard 
} from '@/types/dashboard'

export function generateMockClinic(): Clinic {
  return {
    id: 'clinic-1',
    name: 'MedFlow Central Clinic',
    address: '123 Healthcare Ave, Medical District',
    phone: '(555) 123-4567',
    email: 'contact@medflowclinic.com'
  }
}

export function generateMockDailyStats(): DailyStats {
  return {
    totalVisits: Math.floor(Math.random() * 50) + 30,
    newPatients: Math.floor(Math.random() * 10) + 5,
    revenue: Math.floor(Math.random() * 5000) + 3000,
    satisfaction: Number((Math.random() * (5 - 4) + 4).toFixed(1)),
    completedAppointments: Math.floor(Math.random() * 40) + 20,
    canceledAppointments: Math.floor(Math.random() * 5)
  }
}

export function generateMockAppointments(count: number): Appointment[] {
  const types: Appointment['type'][] = ['Checkup', 'Follow-up', 'Consultation', 'Treatment']
  const status: Appointment['status'][] = ['Scheduled', 'Confirmed', 'Completed', 'Canceled']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `apt-${i + 1}`,
    patientName: `Patient ${i + 1}`,
    patientId: `pat-${i + 1}`,
    dateTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: types[Math.floor(Math.random() * types.length)],
    status: status[Math.floor(Math.random() * status.length)],
    duration: Math.floor(Math.random() * 30) + 15,
    notes: Math.random() > 0.5 ? 'Regular checkup notes' : undefined
  }))
}

export function generateMockActivities(count: number): PatientActivity[] {
  const types: PatientActivity['type'][] = ['Visit', 'Payment', 'Prescription', 'Test', 'Booking']
  const descriptions = {
    Visit: 'Completed regular checkup',
    Payment: 'Processed payment for visit',
    Prescription: 'Received new prescription',
    Test: 'Completed lab tests',
    Booking: 'Scheduled new appointment'
  }
  
  return Array.from({ length: count }, (_, i) => ({
    id: `act-${i + 1}`,
    patientId: `pat-${Math.floor(Math.random() * 100)}`,
    patientName: `Patient ${Math.floor(Math.random() * 100)}`,
    type: types[Math.floor(Math.random() * types.length)],
    description: descriptions[types[Math.floor(Math.random() * types.length)]],
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
  }))
}

export function generateMockStaff(): StaffMember[] {
  const roles: StaffMember['role'][] = ['Doctor', 'Nurse', 'Receptionist', 'Specialist']
  const status: StaffMember['status'][] = ['Available', 'Busy', 'Off', 'Break']
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `staff-${i + 1}`,
    name: `Dr. Smith ${i + 1}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: status[Math.floor(Math.random() * status.length)],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    nextAvailable: new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000).toISOString()
  }))
}

export function generateMockMetrics(): MetricCard[] {
  return [
    {
      title: 'Patient Satisfaction',
      value: '4.8/5',
      change: 0.2,
      trend: 'up',
      description: 'Based on 150 reviews'
    },
    {
      title: 'Average Wait Time',
      value: '12 mins',
      change: -2,
      trend: 'down',
      description: 'Last 7 days average'
    },
    {
      title: 'Monthly Revenue',
      value: '$52,450',
      change: 12.5,
      trend: 'up',
      description: 'Compared to last month'
    },
    {
      title: 'New Patients',
      value: '85',
      change: 5.3,
      trend: 'up',
      description: 'This month'
    }
  ]
}