"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { Pet, SearchFilters } from "@/types/patients"

// In-memory storage for mock data
let mockPets: Pet[] = []

const petSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  dob: z.date(),
  weight: z.number().positive("Weight must be positive"),
  ownerId: z.string(),
  microchipId: z.string().optional(),
  status: z.enum(["active", "deceased", "archived"]),
  lastVisit: z.date().optional(),
  nextAppointment: z.date().optional()
})

export type PetFormData = z.infer<typeof petSchema>

export async function createPet(data: PetFormData) {
  try {
    const validated = petSchema.parse(data)
    
    const pet: Pet = {
      id: crypto.randomUUID(),
      ...validated
    }

    mockPets.push(pet)
    revalidatePath("/dashboard/patients")
    return { success: true, data: pet }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to create pet" }
  }
}

export async function updatePet(id: string, data: Partial<PetFormData>) {
  try {
    const petIndex = mockPets.findIndex(pet => pet.id === id)
    if (petIndex === -1) {
      return { success: false, error: "Pet not found" }
    }

    const partialSchema = petSchema.partial()
    const validated = partialSchema.parse(data)

    mockPets[petIndex] = {
      ...mockPets[petIndex],
      ...validated
    }

    revalidatePath("/dashboard/patients")
    return { success: true, data: mockPets[petIndex] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to update pet" }
  }
}

export async function deletePet(id: string) {
  try {
    const initialLength = mockPets.length
    mockPets = mockPets.filter(pet => pet.id !== id)
    
    if (mockPets.length === initialLength) {
      return { success: false, error: "Pet not found" }
    }

    revalidatePath("/dashboard/patients")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete pet" }
  }
}

export async function getPet(id: string) {
  try {
    const pet = mockPets.find(pet => pet.id === id)
    if (!pet) {
      return { success: false, error: "Pet not found" }
    }

    return { success: true, data: pet }
  } catch (error) {
    return { success: false, error: "Failed to fetch pet" }
  }
}

export async function searchPets(query: string, filters?: SearchFilters) {
  try {
    let filtered = [...mockPets]

    // Apply search query
    if (query) {
      const searchTerm = query.toLowerCase()
      filtered = filtered.filter(pet => 
        pet.name.toLowerCase().includes(searchTerm) ||
        pet.species.toLowerCase().includes(searchTerm) ||
        (pet.breed && pet.breed.toLowerCase().includes(searchTerm))
      )
    }

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(pet => filters.status!.includes(pet.status))
      }

      if (filters.species && filters.species.length > 0) {
        filtered = filtered.filter(pet => filters.species!.includes(pet.species))
      }

      if (filters.dateRange) {
        filtered = filtered.filter(pet => {
          const lastVisit = pet.lastVisit ? new Date(pet.lastVisit) : null
          if (!lastVisit) return false
          
          return lastVisit >= filters.dateRange!.start && 
                 lastVisit <= filters.dateRange!.end
        })
      }

      if (filters.vetId) {
        // In a real app, this would filter based on the assigned vet
        // For now, we'll just return the filtered results
      }
    }

    return { 
      success: true, 
      data: filtered,
      total: filtered.length
    }
  } catch (error) {
    return { success: false, error: "Failed to search pets" }
  }
}

export async function getPetStats() {
  try {
    const stats = {
      total: mockPets.length,
      active: mockPets.filter(pet => pet.status === 'active').length,
      deceased: mockPets.filter(pet => pet.status === 'deceased').length,
      archived: mockPets.filter(pet => pet.status === 'archived').length,
      speciesBreakdown: mockPets.reduce((acc, pet) => {
        acc[pet.species] = (acc[pet.species] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return { success: true, data: stats }
  } catch (error) {
    return { success: false, error: "Failed to fetch pet statistics" }
  }
}

// Initialize with some mock data
import { generateMockPets } from '@/lib/mock-patients'
mockPets = generateMockPets(50)