"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { generateMockPets } from '@/lib/mock-patients'
import { Pet } from '@/types/patients'
import { FileEdit, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PatientHeaderProps {
  patientId: string
}

export function PatientHeader({ patientId }: PatientHeaderProps) {
  const [patient, setPatient] = useState<Pet | null>(null)

  useEffect(() => {
    const pets = generateMockPets(1)
    setPatient(pets[0])
  }, [patientId])

  if (!patient) return null

  const age = Math.floor(
    (new Date().getTime() - new Date(patient.dob).getTime()) /
    (365.25 * 24 * 60 * 60 * 1000)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <p className="text-muted-foreground">
            {patient.species} • {patient.breed} • {age} years old
          </p>
        </div>
        <Button variant="outline">
          <FileEdit className="h-4 w-4 mr-2" />
          Edit Details
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={
              patient.status === 'active' ? 'bg-green-500' :
              patient.status === 'deceased' ? 'bg-gray-500' : 'bg-yellow-500'
            }>
              {patient.status}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm font-medium text-muted-foreground mb-1">Weight</div>
          <div>{patient.weight} kg</div>
        </div>
        
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm font-medium text-muted-foreground mb-1">Microchip ID</div>
          <div>{patient.microchipId || 'Not chipped'}</div>
        </div>
      </div>
    </div>
  )
}