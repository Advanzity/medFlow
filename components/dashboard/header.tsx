"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarRange, Download, UploadCloud } from 'lucide-react'
import { useClinicStore } from '@/hooks/use-clinic'

export function DashboardHeader() {
  const { selectedClinic } = useClinicStore()
  const [dateRange, setDateRange] = useState('today')

  return (
    <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
      <div>
        {selectedClinic && (
          <div>
            <h2 className="text-2xl font-bold">{selectedClinic.name}</h2>
            <p className="text-sm text-muted-foreground">{selectedClinic.address}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col xs:flex-row gap-2 sm:gap-4">      
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <UploadCloud className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}