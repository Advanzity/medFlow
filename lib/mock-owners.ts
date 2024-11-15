import { Owner } from '@/types/owners'
import { subDays } from 'date-fns'

export function generateMockOwners(count: number = 10): Owner[] {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Emily', 'Robert', 'Lisa']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
  const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI']
  
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    return {
      id: `owner-${i + 1}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      address: {
        street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
        city: 'Springfield',
        state: states[Math.floor(Math.random() * states.length)],
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        country: 'USA'
      },
      preferredContact: ['email', 'phone', 'sms'][Math.floor(Math.random() * 3)] as Owner['preferredContact'],
      notes: Math.random() > 0.5 ? 'Some notes about the owner' : undefined,
      createdAt: subDays(new Date(), Math.floor(Math.random() * 365)),
      updatedAt: new Date(),
      petIds: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => `pet-${Math.floor(Math.random() * 50) + 1}`)
    }
  })
}