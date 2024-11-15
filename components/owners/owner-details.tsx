"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Owner } from '@/types/owners'
import { Pet } from '@/types/patients'
import { getOwner } from '@/app/actions/owners'
import { generateMockPets } from '@/lib/mock-patients'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'

interface OwnerDetailsProps {
  ownerId: string
}

export function OwnerDetails({ ownerId }: OwnerDetailsProps) {
  const [owner, setOwner] = useState<Owner | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getOwner(ownerId)
        if (result.success) {
          setOwner(result.data)
          // In a real app, we would fetch the actual pets
          // For now, filter mock pets based on owner's petIds
          const mockPets = generateMockPets(50)
          setPets(mockPets.filter(pet => result.data.petIds.includes(pet.id)))
        } else {
          toast.error('Failed to load owner details')
        }
      } catch (error) {
        toast.error('Error loading owner details')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [ownerId])

  if (isLoading || !owner) return null

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pets" className="w-full">
        <TabsList>
          <TabsTrigger value="pets">Pets</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="pets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Registered Pets</h3>
            <Button>Add Pet</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {pets.map((pet) => (
              <Card key={pet.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{pet.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pet.species} • {pet.breed}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(
                          (new Date().getTime() - new Date(pet.dob).getTime()) /
                            (365.25 * 24 * 60 * 60 * 1000)
                        )} years old
                      </p>
                    </div>
                    <Link href={`/dashboard/patients/${pet.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No upcoming appointments</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No billing history available</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}