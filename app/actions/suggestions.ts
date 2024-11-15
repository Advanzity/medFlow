"use server"

import { z } from "zod"

// Common data structures
interface Suggestion {
  value: string
  label: string
  category?: string
  metadata?: Record<string, any>
}

// Store suggestions per clinic
const mockSuggestions: Map<string, {
  breeds: Record<string, string[]>
  services: Suggestion[]
  products: Suggestion[]
  petNames: string[]
}> = new Map()

// Initialize with some default data
function initializeClinicSuggestions(clinicId: string) {
  if (!mockSuggestions.has(clinicId)) {
    mockSuggestions.set(clinicId, {
      breeds: {
        Dog: [
          'Labrador Retriever',
          'German Shepherd',
          'Golden Retriever',
          'French Bulldog',
          'Bulldog',
          'Poodle',
          'Beagle',
        ],
        Cat: [
          'Persian',
          'Maine Coon',
          'Siamese',
          'British Shorthair',
          'Ragdoll',
          'Bengal',
          'Sphynx',
        ],
        Bird: [
          'Parakeet',
          'Cockatiel',
          'Lovebird',
          'Macaw',
          'African Grey',
          'Canary',
          'Finch',
        ],
        Rabbit: [
          'Holland Lop',
          'Mini Rex',
          'Netherland Dwarf',
          'Dutch',
          'Lionhead',
          'English Angora',
          'French Lop',
        ],
      },
      services: [
        { value: 'checkup', label: 'Regular Checkup', category: 'Examination' },
        { value: 'vaccination', label: 'Vaccination', category: 'Preventive Care' },
        { value: 'dental', label: 'Dental Cleaning', category: 'Dental' },
        { value: 'surgery', label: 'Surgery', category: 'Surgery' },
        { value: 'grooming', label: 'Grooming', category: 'Grooming' },
        { value: 'boarding', label: 'Boarding', category: 'Boarding' },
        { value: 'training', label: 'Training', category: 'Training' },
      ],
      products: [
        { value: 'food-dog', label: 'Dog Food', category: 'Food' },
        { value: 'food-cat', label: 'Cat Food', category: 'Food' },
        { value: 'medicine', label: 'Medicine', category: 'Medicine' },
        { value: 'supplement', label: 'Supplements', category: 'Medicine' },
        { value: 'toy', label: 'Toys', category: 'Accessories' },
        { value: 'leash', label: 'Leashes', category: 'Accessories' },
        { value: 'bed', label: 'Beds', category: 'Accessories' },
      ],
      petNames: [
        'Luna', 'Bella', 'Charlie', 'Lucy', 'Max', 'Bailey', 'Cooper',
        'Daisy', 'Rocky', 'Lily', 'Milo', 'Molly', 'Oliver', 'Ruby'
      ],
    })
  }
  return mockSuggestions.get(clinicId)!
}

// Validation schemas
const searchParamsSchema = z.object({
  clinicId: z.string().min(1, "Clinic ID is required"),
  query: z.string().min(1, "Search query is required"),
  limit: z.number().optional().default(10),
})

const newEntrySchema = z.object({
  clinicId: z.string().min(1, "Clinic ID is required"),
  type: z.enum(["breed", "service", "product", "petName"]),
  value: z.string().min(1, "Value is required"),
  category: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Search functions
export async function searchBreeds(params: {
  clinicId: string
  species: string
  query: string
  limit?: number
}) {
  try {
    const { clinicId, species, query, limit = 10 } = params
    const suggestions = initializeClinicSuggestions(clinicId)

    // Ensure we have valid breeds array for the species
    const breeds = suggestions?.breeds?.[species] ?? []

    const filtered = breeds.filter(breed => 
      breed.toLowerCase().includes(query.toLowerCase())
    )

    return {
      success: true,
      data: filtered.slice(0, limit)
    }
  } catch (error) {
    console.error('Error searching breeds:', error)
    return { success: false, error: "Failed to search breeds" }
  }
}

export async function searchServices(params: z.infer<typeof searchParamsSchema>) {
  try {
    const { clinicId, query, limit } = params
    const suggestions = initializeClinicSuggestions(clinicId)
    
    const filtered = suggestions.services.filter(service =>
      service.label.toLowerCase().includes(query.toLowerCase()) ||
      service.category?.toLowerCase().includes(query.toLowerCase())
    )

    return {
      success: true,
      data: filtered.slice(0, limit)
    }
  } catch (error) {
    console.error('Error searching services:', error)
    return { success: false, error: "Failed to search services" }
  }
}

export async function searchProducts(params: z.infer<typeof searchParamsSchema>) {
  try {
    const { clinicId, query, limit } = params
    const suggestions = initializeClinicSuggestions(clinicId)
    
    const filtered = suggestions.products.filter(product =>
      product.label.toLowerCase().includes(query.toLowerCase()) ||
      product.category?.toLowerCase().includes(query.toLowerCase())
    )

    return {
      success: true,
      data: filtered.slice(0, limit)
    }
  } catch (error) {
    console.error('Error searching products:', error)
    return { success: false, error: "Failed to search products" }
  }
}

export async function searchPetNames(params: z.infer<typeof searchParamsSchema>) {
  try {
    const { clinicId, query, limit } = params
    const suggestions = initializeClinicSuggestions(clinicId)
    
    const filtered = suggestions.petNames.filter(name =>
      name.toLowerCase().includes(query.toLowerCase())
    )

    return {
      success: true,
      data: filtered.slice(0, limit)
    }
  } catch (error) {
    console.error('Error searching pet names:', error)
    return { success: false, error: "Failed to search pet names" }
  }
}

// Add new entries
export async function addNewEntry(data: z.infer<typeof newEntrySchema>) {
  try {
    const validated = newEntrySchema.parse(data)
    const suggestions = initializeClinicSuggestions(validated.clinicId)

    switch (validated.type) {
      case "breed":
        if (!validated.metadata?.species) {
          return { success: false, error: "Species is required for breeds" }
        }
        if (!suggestions.breeds[validated.metadata.species]) {
          suggestions.breeds[validated.metadata.species] = []
        }
        suggestions.breeds[validated.metadata.species].push(validated.value)
        break

      case "service":
        suggestions.services.push({
          value: validated.value.toLowerCase().replace(/\s+/g, '-'),
          label: validated.value,
          category: validated.category,
          metadata: validated.metadata
        })
        break

      case "product":
        suggestions.products.push({
          value: validated.value.toLowerCase().replace(/\s+/g, '-'),
          label: validated.value,
          category: validated.category,
          metadata: validated.metadata
        })
        break

      case "petName":
        suggestions.petNames.push(validated.value)
        break
    }

    mockSuggestions.set(validated.clinicId, suggestions)
    
    return { success: true }
  } catch (error) {
    console.error('Error adding new entry:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to add new entry" }
  }
}