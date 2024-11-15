"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"

// In-memory storage for mock uploads
const mockUploads = new Map<string, {
  id: string
  filename: string
  url: string
  type: string
  size: number
  uploadedAt: Date
  patientId?: string
  recordId?: string
}>()

const uploadSchema = z.object({
  filename: z.string(),
  type: z.string(),
  size: z.number(),
  patientId: z.string().optional(),
  recordId: z.string().optional(),
})

export async function uploadFile(data: z.infer<typeof uploadSchema>) {
  try {
    const validated = uploadSchema.parse(data)
    
    const upload = {
      id: crypto.randomUUID(),
      ...validated,
      url: `https://example.com/uploads/${validated.filename}`,
      uploadedAt: new Date(),
    }

    mockUploads.set(upload.id, upload)
    
    if (validated.recordId) {
      revalidatePath(`/dashboard/patients/${validated.patientId}/records/${validated.recordId}`)
    } else if (validated.patientId) {
      revalidatePath(`/dashboard/patients/${validated.patientId}`)
    }

    return { success: true, data: upload }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to upload file" }
  }
}

export async function getUploads(params: {
  patientId?: string
  recordId?: string
}) {
  try {
    let filtered = Array.from(mockUploads.values())

    if (params.recordId) {
      filtered = filtered.filter(upload => upload.recordId === params.recordId)
    } else if (params.patientId) {
      filtered = filtered.filter(upload => upload.patientId === params.patientId)
    }

    return { 
      success: true, 
      data: filtered.sort((a, b) => 
        b.uploadedAt.getTime() - a.uploadedAt.getTime()
      )
    }
  } catch (error) {
    return { success: false, error: "Failed to fetch uploads" }
  }
}

export async function deleteUpload(id: string) {
  try {
    const upload = mockUploads.get(id)
    if (!upload) {
      return { success: false, error: "Upload not found" }
    }

    mockUploads.delete(id)

    if (upload.recordId) {
      revalidatePath(`/dashboard/patients/${upload.patientId}/records/${upload.recordId}`)
    } else if (upload.patientId) {
      revalidatePath(`/dashboard/patients/${upload.patientId}`)
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete upload" }
  }
}