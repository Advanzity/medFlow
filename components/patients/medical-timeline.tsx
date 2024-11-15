"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { generateMockMedicalRecords } from '@/lib/mock-patients'
import { MedicalRecord } from '@/types/patients'
import { format } from 'date-fns'
import { FileText, Syringe, Stethoscope, TestTube, Scissors } from 'lucide-react'

const recordTypeIcons = {
  exam: Stethoscope,
  vaccine: Syringe,
  surgery: Scissors,
  prescription: FileText,
  lab: TestTube,
}

interface MedicalTimelineProps {
  patientId: string
}

export function MedicalTimeline({ patientId }: MedicalTimelineProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    setRecords(generateMockMedicalRecords(patientId, 10))
  }, [patientId])

  const filteredRecords = selectedType === 'all' 
    ? records 
    : records.filter(record => record.type === selectedType)

  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Medical Records</CardTitle>
        <Button>Add Record</Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedType}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="exam">Exams</TabsTrigger>
            <TabsTrigger value="vaccine">Vaccines</TabsTrigger>
            <TabsTrigger value="surgery">Surgeries</TabsTrigger>
            <TabsTrigger value="prescription">Prescriptions</TabsTrigger>
            <TabsTrigger value="lab">Lab Results</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-8">
            {sortedRecords.map((record) => {
              const Icon = recordTypeIcons[record.type]
              
              return (
                <div key={record.id} className="relative pl-8 pb-8 last:pb-0">
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
                        <span className="text-sm text-muted-foreground">{record.diagnosis}</span>
                      </div>
                    )}
                    
                    {record.treatment && (
                      <div>
                        <span className="text-sm font-medium">Treatment: </span>
                        <span className="text-sm text-muted-foreground">{record.treatment}</span>
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground">{record.notes}</div>
                    
                    {record.followUpDate && (
                      <div className="text-sm">
                        <span className="font-medium">Follow-up: </span>
                        {format(new Date(record.followUpDate), 'PP')}
                      </div>
                    )}
                    
                    {record.attachments && record.attachments.length > 0 && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {record.attachments.length} attachment{record.attachments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}