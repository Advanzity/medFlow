import { z } from "zod"

// Common suggestion interface
export interface Suggestion {
  id: string
  value: string
  label: string
  category?: string
  metadata?: Record<string, any>
}

// Input schemas for different suggestion types
export const breedSearchSchema = z.object({
  clinicId: z.string().min(1, "Clinic ID is required"),
  species: z.string().min(1, "Species is required"),
  query: z.string().min(1, "Search query is required"),
  limit: z.number().optional().default(10)
})

export const serviceSearchSchema = z.object({
  clinicId: z.string().min(1, "Clinic ID is required"),
  query: z.string().min(1, "Search query is required"),
  limit: z.number().optional().default(10),
  type: z.enum(["all", "exam", "vaccine", "surgery", "prescription", "lab"]).optional()
})

export const productSearchSchema = z.object({
  clinicId: z.string().min(1, "Clinic ID is required"),
  query: z.string().min(1, "Search query is required"),
  limit: z.number().optional().default(10),
  category: z.string().optional()
})

export const petNameSearchSchema = z.object({
  clinicId: z.string().min(1, "Clinic ID is required"),
  query: z.string().min(1, "Search query is required"),
  limit: z.number().optional().default(10)
})

export const newSuggestionSchema = z.object({
  clinicId: z.string().min(1, "Clinic ID is required"),
  type: z.enum(["breed", "service", "product", "petName"]),
  value: z.string().min(1, "Value is required"),
  category: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

// Type definitions for search results
export interface SearchResult<T = Suggestion> {
  success: boolean
  data?: T[]
  error?: string | z.ZodError
  total?: number
}

// Type definitions for suggestion categories
export interface BreedSuggestion extends Suggestion {
  species: string
}

export interface ServiceSuggestion extends Suggestion {
  duration: number
  price: number
  description: string
}

export interface ProductSuggestion extends Suggestion {
  price: number
  sku?: string
  inStock: boolean
}

// Type definitions for suggestion stores
export interface SuggestionStore {
  breeds: Record<string, string[]>
  services: ServiceSuggestion[]
  products: ProductSuggestion[]
  petNames: string[]
}

// Type inference helpers
export type SearchSchemaType = z.infer<typeof breedSearchSchema> |
  z.infer<typeof serviceSearchSchema> |
  z.infer<typeof productSearchSchema> |
  z.infer<typeof petNameSearchSchema>

export type NewSuggestionType = z.infer<typeof newSuggestionSchema>