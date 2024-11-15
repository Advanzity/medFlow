"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getStaffStatus } from '@/app/actions/dashboard'
import { format } from 'date-fns'
import { useClinicStore } from '@/hooks/use-clinic'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

const statusColors = {
  Available: 'bg-green-500',
  Busy: 'bg-yellow-500',
  Off: 'bg-gray-500',
  Break: 'bg-blue-500',
}

export function StaffStatus() {
  const [staff, setStaff] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { selectedClinic } = useClinicStore()

  useEffect(() => {
    async function loadStaffStatus() {
      if (!selectedClinic?.id) return

      try {
        const result = await getStaffStatus(selectedClinic.id)
        if (result.success) {
          setStaff(result.data || [])
        } else {
          toast.error('Failed to load staff status')
        }
      } catch (error) {
        toast.error('Error loading staff status')
      } finally {
        setIsLoading(false)
      }
    }

    loadStaffStatus()
    // Refresh staff status every 2 minutes
    const interval = setInterval(loadStaffStatus, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedClinic])

  if (!selectedClinic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Please select a clinic to view staff status
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {staff.map((member: { id: string; avatar: string; name: string; role: string; status: keyof typeof statusColors; nextAvailable?: string }) => (
            <div
              key={member.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${statusColors[member.status]}`} />
                <span className="text-sm font-medium">{member.status}</span>
                {member.status !== 'Available' && member.nextAvailable && (
                  <span className="text-xs text-muted-foreground">
                    Until {format(new Date(member.nextAvailable), 'h:mm a')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}