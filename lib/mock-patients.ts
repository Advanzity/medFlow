import { Pet, MedicalRecord, Treatment } from '@/types/patients'
import { addDays, subDays } from 'date-fns'

export function generateMockPets(count: number = 10): Pet[] {
  const species = ['Dog', 'Cat', 'Bird', 'Rabbit']
  const breeds = {
    Dog: ['Labrador', 'German Shepherd', 'Golden Retriever', 'Poodle'],
    Cat: ['Persian', 'Siamese', 'Maine Coon', 'Ragdoll'],
    Bird: ['Parakeet', 'Cockatiel', 'Macaw', 'Canary'],
    Rabbit: ['Holland Lop', 'Dutch', 'Mini Rex', 'Lionhead']
  }
  const status: Pet['status'][] = ['active', 'deceased', 'archived']

  return Array.from({ length: count }, (_, i) => {
    const selectedSpecies = species[Math.floor(Math.random() * species.length)]
    const selectedBreeds = breeds[selectedSpecies as keyof typeof breeds]
    
    return {
      id: `pet-${i + 1}`,
      name: `Pet ${i + 1}`,
      species: selectedSpecies,
      breed: selectedBreeds[Math.floor(Math.random() * selectedBreeds.length)],
      dob: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000),
      weight: Math.round(Math.random() * 50 * 10) / 10,
      ownerId: `owner-${Math.floor(Math.random() * 20) + 1}`,
      microchipId: Math.random() > 0.3 ? `chip-${Math.random().toString(36).substr(2, 9)}` : undefined,
      status: status[Math.floor(Math.random() * status.length)],
      lastVisit: subDays(new Date(), Math.floor(Math.random() * 30)),
      nextAppointment: Math.random() > 0.5 ? addDays(new Date(), Math.floor(Math.random() * 30)) : undefined
    }
  })
}

export function generateMockMedicalRecords(petId: string, count: number = 5): MedicalRecord[] {
  const types: MedicalRecord['type'][] = ['exam', 'vaccine', 'surgery', 'prescription', 'lab']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `record-${petId}-${i + 1}`,
    petId,
    date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    type: types[Math.floor(Math.random() * types.length)],
    notes: `Medical record notes for visit ${i + 1}`,
    attachments: Math.random() > 0.5 ? [`attachment-${i + 1}`] : undefined,
    vetId: `vet-${Math.floor(Math.random() * 5) + 1}`,
    diagnosis: Math.random() > 0.3 ? `Diagnosis ${i + 1}` : undefined,
    treatment: Math.random() > 0.3 ? `Treatment plan ${i + 1}` : undefined,
    followUpDate: Math.random() > 0.5 ? addDays(new Date(), Math.floor(Math.random() * 30)) : undefined
  }))
}

export function generateMockTreatments(recordId: string, count: number = 3): Treatment[] {
  const status: Treatment['status'][] = ['scheduled', 'in-progress', 'completed']
  const priorities: Treatment['priority'][] = ['low', 'medium', 'high']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `treatment-${recordId}-${i + 1}`,
    recordId,
    name: `Treatment ${i + 1}`,
    status: status[Math.floor(Math.random() * status.length)],
    instructions: `Treatment instructions ${i + 1}`,
    followUp: Math.random() > 0.5 ? addDays(new Date(), Math.floor(Math.random() * 14)) : undefined,
    assignedTo: `vet-${Math.floor(Math.random() * 5) + 1}`,
    startDate: new Date(),
    endDate: Math.random() > 0.3 ? addDays(new Date(), Math.floor(Math.random() * 14)) : undefined,
    priority: priorities[Math.floor(Math.random() * priorities.length)]
  }))
}