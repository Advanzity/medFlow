import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function checkAccess(userId: string, clinicId: string): Promise<boolean> {
  // Mocked access control logic. Replace with your database or API call.
  const userClinics = await getUserClinics(userId); // Fetch clinics the user has access to.
  return userClinics.includes(clinicId);
}

async function getUserClinics(userId: string): Promise<string[]> {
  // Replace with real data fetching
  return ["clinic1", "clinic2", "clinic3"]; // Example clinics the user has access to.
}
