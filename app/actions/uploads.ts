"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { checkAccess } from "@/lib/utils";

const mockUploads = new Map<string, {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
  patientId?: string;
  recordId?: string;
  clinicId: string;
}>();

const unauthorizedError = () => new Error("Unauthorized");

const uploadSchema = z.object({
  filename: z.string(),
  type: z.string(),
  size: z.number(),
  patientId: z.string().optional(),
  recordId: z.string().optional(),
  clinicId: z.string(), // Add clinicId
});

export async function uploadFile(userId: string, data: z.infer<typeof uploadSchema>) {
  try {
    const validated = uploadSchema.parse(data);

    // Check if the user has access to the clinic
    const hasAccess = await checkAccess(userId, validated.clinicId);
    if (!hasAccess) throw unauthorizedError();

    const upload = {
      id: crypto.randomUUID(),
      ...validated,
      url: `https://example.com/uploads/${validated.filename}`,
      uploadedAt: new Date(),
    };

    mockUploads.set(upload.id, upload);

    if (validated.recordId) {
      revalidatePath(`/dashboard/clinics/${validated.clinicId}/patients/${validated.patientId}/records/${validated.recordId}`);
    } else if (validated.patientId) {
      revalidatePath(`/dashboard/clinics/${validated.clinicId}/patients/${validated.patientId}`);
    }

    return { success: true, data: upload };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: "Failed to upload file" };
  }
}

export async function getUploads(userId: string, params: {
  clinicId: string;
  patientId?: string;
  recordId?: string;
}) {
  try {
    // Check if the user has access to the clinic
    const hasAccess = await checkAccess(userId, params.clinicId);
    if (!hasAccess) throw unauthorizedError();

    let filtered = Array.from(mockUploads.values()).filter(upload => upload.clinicId === params.clinicId);

    if (params.recordId) {
      filtered = filtered.filter(upload => upload.recordId === params.recordId);
    } else if (params.patientId) {
      filtered = filtered.filter(upload => upload.patientId === params.patientId);
    }

    return {
      success: true,
      data: filtered.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()),
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch uploads" };
  }
}

export async function deleteUpload(userId: string, clinicId: string, id: string) {
  try {
    // Check if the user has access to the clinic
    const hasAccess = await checkAccess(userId, clinicId);
    if (!hasAccess) throw unauthorizedError();

    const upload = mockUploads.get(id);
    if (!upload || upload.clinicId !== clinicId) {
      return { success: false, error: "Upload not found or unauthorized" };
    }

    mockUploads.delete(id);

    if (upload.recordId) {
      revalidatePath(`/dashboard/clinics/${clinicId}/patients/${upload.patientId}/records/${upload.recordId}`);
    } else if (upload.patientId) {
      revalidatePath(`/dashboard/clinics/${clinicId}/patients/${upload.patientId}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete upload" };
  }
}
