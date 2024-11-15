import { AppointmentType } from '@/types/appointments'

export const appointmentTypes: AppointmentType[] = [
  {
    id: 'checkup',
    name: 'Regular Checkup',
    color: '#4CAF50',
    duration: 30,
    defaultPrice: 50,
    requiredResources: ['exam-room'],
    description: 'Routine health examination',
    preparationInstructions: 'No special preparation needed'
  },
  {
    id: 'vaccination',
    name: 'Vaccination',
    color: '#2196F3',
    duration: 15,
    defaultPrice: 35,
    requiredResources: ['exam-room'],
    description: 'Pet vaccination appointment',
    preparationInstructions: 'Bring vaccination history'
  },
  {
    id: 'surgery',
    name: 'Surgery',
    color: '#F44336',
    duration: 120,
    defaultPrice: 200,
    requiredResources: ['surgery-room', 'recovery-room'],
    description: 'Surgical procedure',
    preparationInstructions: 'No food 12 hours before surgery'
  },
  {
    id: 'dental',
    name: 'Dental Cleaning',
    color: '#9C27B0',
    duration: 60,
    defaultPrice: 120,
    requiredResources: ['dental-room'],
    description: 'Dental cleaning and examination',
    preparationInstructions: 'No food 8 hours before procedure'
  }
];