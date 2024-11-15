"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { generateMockStaff } from '@/lib/mock-data'
import { format } from 'date-fns'

const statusColors = {
  Available: 'bg-green-500',
  Busy: 'bg-yellow-500',
  Off: 'bg-gray-500',
  Break: 'bg-blue-500',
}

export function StaffStatus() {
  const [staff, setStaff] = useState(generateMockStaff())

  useEffect(() => {
    const interval = setInterval(() => {
      setStaff(generateMockStaff())
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {staff.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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