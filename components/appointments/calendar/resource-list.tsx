"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {resources.map(resource => (
            <div
              key={resource.id}
              className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
              onClick={() => onResourceSelect(resource)}
            >
              <div>
                <div className="font-medium">{resource.name}</div>
                <div className="text-sm text-muted-foreground capitalize">{resource.type}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${statusColors[resource.status]}`} />
                <span className="text-sm capitalize">{resource.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}