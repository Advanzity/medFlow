"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Resource {
  id: string
  name: string
  type: 'room' | 'equipment' | 'staff'
  status: 'available' | 'busy' | 'maintenance'
}

interface ResourceListProps {
  resources: Resource[]
  onResourceSelect: (resource: Resource) => void
}

export function ResourceList({ resources, onResourceSelect }: ResourceListProps) {
  const statusColors = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    maintenance: 'bg-red-500'
  }

  const statusIcons = {
    available: Clock,
    busy: Calendar,
    maintenance: AlertCircle
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {resources.map(resource => {
            const Icon = statusIcons[resource.status]
            
            return (
              <Button
                key={resource.id}
                variant="ghost"
                className="w-full justify-between hover:bg-accent"
                onClick={() => onResourceSelect(resource)}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{resource.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{resource.type}</div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "ml-2",
                    statusColors[resource.status]
                  )}
                >
                  {resource.status}
                </Badge>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}