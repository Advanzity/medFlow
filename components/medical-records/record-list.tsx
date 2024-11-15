"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useClinicStore } from '@/hooks/use-clinic'
import { getMedicalRecords } from '@/app/actions/medical-records'
import { MedicalRecord } from '@/types/patients'
import { format } from 'date-fns'
import { Plus, FileText, Syringe, Stethoscope, TestTube, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { AddRecordDialog } from './add-record-dialog'

const recordTypeIcons = {
  exam: Stethoscope,
  vaccine: Syringe,
  surgery: Scissors,
  prescription: FileText,
  lab: TestTube,
}

export function RecordList({ petId }: { petId?: string }) {
  const { selectedClinic } = useClinicStore()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)

  const loadRecords = async () => {
    if (!selectedClinic?.id) return

    setIsLoading(true)
    try {
      const result = await getMedicalRecords({
        clinicId: selectedClinic.id,
        petId,
        type: selectedType === 'all' ? undefined : selectedType as MedicalRecord['type']
      })

      if (result.success) {
        setRecords(result.data)
      } else {
        toast.error(result.error as string)
      }
    } catch (error) {
      toast.error('Failed to load records')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedClinic) {
      loadRecords()
    }
  }, [selectedClinic, selectedType])

  const handleAddSuccess = () => {
    setShowAddDialog(false)
    loadRecords()
    toast.success('Record added successfully')
  }

  if (!selectedClinic) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p className="text-gray-500">Please select a clinic to view records</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Medical Records</CardTitle>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="exam">Examinations</SelectItem>
              <SelectItem value="vaccine">Vaccinations</SelectItem>
              <SelectItem value="surgery">Surgeries</SelectItem>
              <SelectItem value="prescription">Prescriptions</SelectItem>
              <SelectItem value="lab">Lab Results</SelectItem>
            </SelectContent>
          </Select>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No records found
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => {
                const Icon = recordTypeIcons[record.type]
                return (
                  <div
                    key={record.id}
                    className="relative pl-8 pb-8 last:pb-0"
                  >
                    <div className="absolute left-0 top-0 h-full w-px bg-border">
                      <div className="absolute -left-1.5 top-0 h-4 w-4 rounded-full border bg-background flex items-center justify-center">
                        <Icon className="h-2.5 w-2.5 text-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {record.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(record.date), 'PPp')}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </div>
                      
                      {record.diagnosis && (
                        <div>
                          <span className="text-sm font-medium">Diagnosis: </span>
                          <span className="text-sm text-muted-foreground">
                            {record.diagnosis}
                          </span>
                        </div>
                      )}
                      
                      {record.treatment && (
                        <div>
                          <span className="text-sm font-medium">Treatment: </span>
                          <span className="text-sm text-muted-foreground">
                            {record.treatment}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        {record.notes}
                      </div>
                      
                      {record.followUpDate && (
                        <div className="text-sm">
                          <span className="font-medium">Follow-up: </span>
                          {format(new Date(record.followUpDate), 'PP')}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>

      <AddRecordDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
        petId={petId}
      />
    </Card>
  )
}