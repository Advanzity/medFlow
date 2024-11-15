"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { Owner, OwnerFilters } from "@/types/owners"
import { generateMockOwners } from "@/lib/mock-owners"

// In-memory storage for mock data
let mockOwners: Owner[] = generateMockOwners(50)

const ownerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
    country: z.string().min(1, "Country is required")
  }),
  preferredContact: z.enum(["email", "phone", "sms"]),
  notes: z.string().optional(),
  petIds: z.array(z.string())
})

export type OwnerFormData = z.infer<typeof ownerSchema>

export async function createOwner(data: OwnerFormData) {
  try {
    const validated = ownerSchema.parse(data)
    
    const owner: Owner = {
      id: crypto.randomUUID(),
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockOwners.push(owner)
    revalidatePath("/dashboard/owners")
    return { success: true, data: owner }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to create owner" }
  }
}

export async function updateOwner(id: string, data: Partial<OwnerFormData>) {
  try {
    const ownerIndex = mockOwners.findIndex(owner => owner.id === id)
    if (ownerIndex === -1) {
      return { success: false, error: "Owner not found" }
    }

    const partialSchema = ownerSchema.partial()
    const validated = partialSchema.parse(data)

    mockOwners[ownerIndex] = {
      ...mockOwners[ownerIndex],
      ...validated,
      updatedAt: new Date()
    }

    revalidatePath("/dashboard/owners")
    return { success: true, data: mockOwners[ownerIndex] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to update owner" }
  }
}

export async function deleteOwner(id: string) {
  try {
    const initialLength = mockOwners.length
    mockOwners = mockOwners.filter(owner => owner.id !== id)
    
    if (mockOwners.length === initialLength) {
      return { success: false, error: "Owner not found" }
    }

    revalidatePath("/dashboard/owners")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete owner" }
  }
}

export async function getOwner(id: string) {
  try {
    const owner = mockOwners.find(owner => owner.id === id)
    if (!owner) {
      return { success: false, error: "Owner not found" }
    }

    return { success: true, data: owner }
  } catch (error) {
    return { success: false, error: "Failed to fetch owner" }
  }
}

export async function searchOwners(filters?: OwnerFilters) {
  try {
    let filtered = [...mockOwners]

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(owner => 
        owner.firstName.toLowerCase().includes(searchTerm) ||
        owner.lastName.toLowerCase().includes(searchTerm) ||
        owner.email.toLowerCase().includes(searchTerm) ||
        owner.phone.includes(searchTerm)
      )
    }

    if (filters?.hasPets !== undefined) {
      filtered = filtered.filter(owner => 
        filters.hasPets ? owner.petIds.length > 0 : owner.petIds.length === 0
      )
    }

    if (filters?.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[filters.sortBy!]
        const bValue = b[filters.sortBy!]
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortOrder === 'desc'
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue)
        }
        
        if (aValue instanceof Date && bValue instanceof Date) {
          return filters.sortOrder === 'desc'
            ? bValue.getTime() - aValue.getTime()
            : aValue.getTime() - bValue.getTime()
        }
        
        return 0
      })
    }

    return { 
      success: true, 
      data: filtered,
      total: filtered.length
    }
  } catch (error) {
    return { success: false, error: "Failed to search owners" }
  }
}

export async function getOwnersByPet(petId: string) {
  try {
    const owners = mockOwners.filter(owner => owner.petIds.includes(petId))
    return { success: true, data: owners }
  } catch (error) {
    return { success: false, error: "Failed to fetch owners" }
  }
}

export async function addPetToOwner(ownerId: string, petId: string) {
  try {
    const ownerIndex = mockOwners.findIndex(owner => owner.id === ownerId)
    if (ownerIndex === -1) {
      return { success: false, error: "Owner not found" }
    }

    if (!mockOwners[ownerIndex].petIds.includes(petId)) {
      mockOwners[ownerIndex].petIds.push(petId)
      mockOwners[ownerIndex].updatedAt = new Date()
    }

    revalidatePath("/dashboard/owners")
    return { success: true, data: mockOwners[ownerIndex] }
  } catch (error) {
    return { success: false, error: "Failed to add pet to owner" }
  }
}

export async function removePetFromOwner(ownerId: string, petId: string) {
  try {
    const ownerIndex = mockOwners.findIndex(owner => owner.id === ownerId)
    if (ownerIndex === -1) {
      return { success: false, error: "Owner not found" }
    }

    mockOwners[ownerIndex].petIds = mockOwners[ownerIndex].petIds.filter(id => id !== petId)
    mockOwners[ownerIndex].updatedAt = new Date()

    revalidatePath("/dashboard/owners")
    return { success: true, data: mockOwners[ownerIndex] }
  } catch (error) {
    return { success: false, error: "Failed to remove pet from owner" }
  }
}