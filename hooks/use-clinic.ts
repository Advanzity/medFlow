"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Clinic } from '@/types/dashboard'

interface ClinicStore {
  selectedClinic: Clinic | null
  clinics: Clinic[]
  setSelectedClinic: (clinic: Clinic) => void
  addClinic: (clinic: Clinic) => void
  removeClinic: (id: string) => void
}

export const useClinicStore = create<ClinicStore>()(
  persist(
    (set) => ({
      selectedClinic: null,
      clinics: [
        {
          id: 'central',
          name: 'MedFlow Central Clinic',
          address: '123 Healthcare Ave, Medical District',
          phone: '(555) 123-4567',
          email: 'central@medflow.com',
        },
        {
          id: 'north',
          name: 'MedFlow North Branch',
          address: '456 Wellness Blvd, North District',
          phone: '(555) 234-5678',
          email: 'north@medflow.com',
        },
        {
          id: 'south',
          name: 'MedFlow South Branch',
          address: '789 Care Street, South District',
          phone: '(555) 345-6789',
          email: 'south@medflow.com',
        },
      ],
      setSelectedClinic: (clinic) => set({ selectedClinic: clinic }),
      addClinic: (clinic) =>
        set((state) => ({ clinics: [...state.clinics, clinic] })),
      removeClinic: (id) =>
        set((state) => ({
          clinics: state.clinics.filter((clinic) => clinic.id !== id),
        })),
    }),
    {
      name: 'clinic-storage',
    }
  )
)