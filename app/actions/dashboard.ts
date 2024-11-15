"use server"

import { z } from "zod"
import { DailyStats, Clinic, StaffMember, PatientActivity } from "@/types/dashboard"
import { AppointmentStatus } from "@/types/appointments"

// In-memory storage for mock data
const mockDailyStats = new Map<string, DailyStats>()
const mockActivities = new Map<string, PatientActivity[]>()

export async function getDailyStats(clinicId: string): Promise<{ 
  success: boolean
  data?: DailyStats
  error?: string 
}> {
  try {
    // Generate or retrieve stats for the specific clinic
    if (!mockDailyStats.has(clinicId)) {
      mockDailyStats.set(clinicId, {
        totalVisits: Math.floor(Math.random() * 50) + 30,
        newPatients: Math.floor(Math.random() * 10) + 5,
        revenue: Math.floor(Math.random() * 5000) + 3000,
        satisfaction: Number((Math.random() * (5 - 4) + 4).toFixed(1)),
        completedAppointments: Math.floor(Math.random() * 40) + 20,
        canceledAppointments: Math.floor(Math.random() * 5)
      })
    }

    return {
      success: true,
      data: mockDailyStats.get(clinicId)
    }
  } catch (error) {
    console.error('Error getting daily stats:', error)
    return { success: false, error: 'Failed to fetch daily statistics' }
  }
}

export async function getRecentActivity(clinicId: string, limit: number = 8): Promise<{
  success: boolean
  data?: PatientActivity[]
  error?: string
}> {
  try {
    // Generate or retrieve activities for the specific clinic
    if (!mockActivities.has(clinicId)) {
      const types: PatientActivity['type'][] = ['Visit', 'Payment', 'Prescription', 'Test', 'Booking']
      const descriptions = {
        Visit: 'Completed regular checkup',
        Payment: 'Processed payment for visit',
        Prescription: 'Received new prescription',
        Test: 'Completed lab tests',
        Booking: 'Scheduled new appointment'
      }

      const activities = Array.from({ length: limit }, (_, i) => ({
        id: `act-${i + 1}`,
        patientId: `pat-${Math.floor(Math.random() * 100)}`,
        patientName: `Patient ${Math.floor(Math.random() * 100)}`,
        type: types[Math.floor(Math.random() * types.length)],
        description: descriptions[types[Math.floor(Math.random() * types.length)] as keyof typeof descriptions],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }))

      mockActivities.set(clinicId, activities)
    }

    return {
      success: true,
      data: mockActivities.get(clinicId)?.slice(0, limit)
    }
  } catch (error) {
    console.error('Error getting recent activity:', error)
    return { success: false, error: 'Failed to fetch recent activity' }
  }
}

export async function getStaffStatus(clinicId: string): Promise<{
  success: boolean
  data?: StaffMember[]
  error?: string
}> {
  try {
    const roles: StaffMember['role'][] = ['Doctor', 'Nurse', 'Receptionist', 'Specialist']
    const status: StaffMember['status'][] = ['Available', 'Busy', 'Off', 'Break']

    const staff = Array.from({ length: 8 }, (_, i) => ({
      id: `staff-${clinicId}-${i + 1}`,
      name: `Dr. Smith ${i + 1}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: status[Math.floor(Math.random() * status.length)],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${clinicId}-${i}`,
      nextAvailable: new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000).toISOString()
    }))

    return {
      success: true,
      data: staff
    }
  } catch (error) {
    console.error('Error getting staff status:', error)
    return { success: false, error: 'Failed to fetch staff status' }
  }
}

export async function getDashboardMetrics(clinicId: string): Promise<{
  success: boolean
  data?: {
    appointments: {
      total: number
      upcoming: number
      completed: number
      canceled: number
    }
    patients: {
      total: number
      active: number
      new: number
    }
    revenue: {
      daily: number
      weekly: number
      monthly: number
      growth: number
    }
  }
  error?: string
}> {
  try {
    return {
      success: true,
      data: {
        appointments: {
          total: Math.floor(Math.random() * 1000) + 500,
          upcoming: Math.floor(Math.random() * 100) + 50,
          completed: Math.floor(Math.random() * 800) + 400,
          canceled: Math.floor(Math.random() * 50)
        },
        patients: {
          total: Math.floor(Math.random() * 5000) + 1000,
          active: Math.floor(Math.random() * 3000) + 500,
          new: Math.floor(Math.random() * 100) + 20
        },
        revenue: {
          daily: Math.floor(Math.random() * 5000) + 1000,
          weekly: Math.floor(Math.random() * 25000) + 5000,
          monthly: Math.floor(Math.random() * 100000) + 20000,
          growth: Number((Math.random() * 20 - 5).toFixed(1))
        }
      }
    }
  } catch (error) {
    console.error('Error getting dashboard metrics:', error)
    return { success: false, error: 'Failed to fetch dashboard metrics' }
  }
}