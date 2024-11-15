"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"

// Practice Settings Schema
const practiceSettingsSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  operatingHours: z.array(z.object({
    day: z.number(),
    start: z.string(),
    end: z.string(),
    isOpen: z.boolean()
  })),
  branding: z.object({
    logo: z.string().optional(),
    primaryColor: z.string(),
    theme: z.enum(["light", "dark", "system"])
  }),
  licenses: z.array(z.object({
    type: z.string(),
    number: z.string(),
    expiryDate: z.string()
  }))
})

// Operational Settings Schema
const operationalSettingsSchema = z.object({
  scheduling: z.object({
    bufferTime: z.number(),
    minAdvanceBooking: z.number(),
    maxAdvanceBooking: z.number(),
    allowDoubleBooking: z.boolean()
  }),
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    duration: z.number(),
    capacity: z.number(),
    price: z.number()
  })),
  resources: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["room", "equipment"]),
    capacity: z.number()
  }))
})

// Staff Settings Schema
const staffSettingsSchema = z.object({
  roles: z.array(z.object({
    id: z.string(),
    name: z.string(),
    permissions: z.array(z.string())
  })),
  staff: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    specializations: z.array(z.string()),
    availability: z.array(z.object({
      day: z.number(),
      shifts: z.array(z.object({
        start: z.string(),
        end: z.string()
      }))
    }))
  }))
})

// Communication Settings Schema
const communicationSettingsSchema = z.object({
  templates: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["email", "sms", "push"]),
    subject: z.string(),
    content: z.string(),
    variables: z.array(z.string())
  })),
  reminders: z.array(z.object({
    id: z.string(),
    type: z.string(),
    timing: z.number(),
    template: z.string()
  })),
  preferences: z.object({
    defaultChannel: z.enum(["email", "sms", "push"]),
    languages: z.array(z.string())
  })
})

// Financial Settings Schema
const financialSettingsSchema = z.object({
  payment: z.object({
    gateway: z.string(),
    currency: z.string(),
    taxRate: z.number()
  }),
  billing: z.array(z.object({
    code: z.string(),
    description: z.string(),
    fee: z.number()
  })),
  insurance: z.array(z.object({
    provider: z.string(),
    planTypes: z.array(z.string()),
    contactInfo: z.object({
      phone: z.string(),
      email: z.string()
    })
  }))
})

// Mock data storage
let mockSettings = {
  practice: {
    name: "MedFlow Clinic",
    address: "123 Healthcare Ave",
    phone: "(555) 123-4567",
    email: "contact@medflow.com",
    operatingHours: [
      { day: 1, start: "09:00", end: "17:00", isOpen: true },
      { day: 2, start: "09:00", end: "17:00", isOpen: true },
      { day: 3, start: "09:00", end: "17:00", isOpen: true },
      { day: 4, start: "09:00", end: "17:00", isOpen: true },
      { day: 5, start: "09:00", end: "17:00", isOpen: true },
      { day: 6, start: "10:00", end: "14:00", isOpen: true },
      { day: 0, start: "00:00", end: "00:00", isOpen: false }
    ],
    branding: {
      primaryColor: "#0066cc",
      theme: "system"
    },
    licenses: [
      {
        type: "Medical License",
        number: "ML123456",
        expiryDate: "2024-12-31"
      }
    ]
  }
}

// Server actions
export async function updatePracticeSettings(clinicId: string, data: z.infer<typeof practiceSettingsSchema>) {
  try {
    const validated = practiceSettingsSchema.parse(data)
    mockSettings.practice = validated
    revalidatePath("/dashboard/settings")
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to update practice settings" }
  }
}

export async function getPracticeSettings(clinicId: string) {
  try {
    return { success: true, data: mockSettings.practice }
  } catch (error) {
    return { success: false, error: "Failed to fetch practice settings" }
  }
}

// Similar functions for other settings sections...
export async function getOperationalSettings(clinicId: string) {
  // Mock data
  return {
    success: true,
    data: {
      scheduling: {
        bufferTime: 15,
        minAdvanceBooking: 1,
        maxAdvanceBooking: 60,
        allowDoubleBooking: false
      },
      services: [
        {
          id: "checkup",
          name: "Regular Checkup",
          duration: 30,
          capacity: 1,
          price: 100
        }
      ],
      resources: [
        {
          id: "room1",
          name: "Examination Room 1",
          type: "room",
          capacity: 1
        }
      ]
    }
  }
}

export async function getStaffSettings(clinicId: string) {
  // Mock data
  return {
    success: true,
    data: {
      roles: [
        {
          id: "admin",
          name: "Administrator",
          permissions: ["all"]
        },
        {
          id: "doctor",
          name: "Doctor",
          permissions: ["view_patients", "edit_records"]
        }
      ],
      staff: [
        {
          id: "staff1",
          name: "Dr. Smith",
          role: "doctor",
          specializations: ["General Practice"],
          availability: [
            {
              day: 1,
              shifts: [{ start: "09:00", end: "17:00" }]
            }
          ]
        }
      ]
    }
  }
}

export async function getCommunicationSettings(clinicId: string) {
  // Mock data
  return {
    success: true,
    data: {
      templates: [
        {
          id: "appt-reminder",
          name: "Appointment Reminder",
          type: "email",
          subject: "Upcoming Appointment Reminder",
          content: "Dear {{patient}}, this is a reminder of your appointment...",
          variables: ["patient", "date", "time"]
        }
      ],
      reminders: [
        {
          id: "24h",
          type: "appointment",
          timing: 24,
          template: "appt-reminder"
        }
      ],
      preferences: {
        defaultChannel: "email",
        languages: ["en", "es"]
      }
    }
  }
}

export async function getFinancialSettings(clinicId: string) {
  // Mock data
  return {
    success: true,
    data: {
      payment: {
        gateway: "stripe",
        currency: "USD",
        taxRate: 8.5
      },
      billing: [
        {
          code: "CHECKUP",
          description: "Regular Checkup",
          fee: 100
        }
      ],
      insurance: [
        {
          provider: "HealthCare Plus",
          planTypes: ["PPO", "HMO"],
          contactInfo: {
            phone: "(555) 987-6543",
            email: "claims@healthcareplus.com"
          }
        }
      ]
    }
  }
}