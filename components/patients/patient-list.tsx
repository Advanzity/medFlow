"use client"

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pet, SearchFilters } from '@/types/patients'
import { searchPets } from '@/app/actions/patients'
import { format } from 'date-fns'
import { Search, Filter, Loader2, Plus } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import { AddPatientDialog } from './add-patient-dialog'

export function PatientList() {
  const [patients, setPatients] = useState<Pet[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    loadPatients()
  }, [debouncedSearch, filters])

  const loadPatients = async () => {
    setIsLoading(true)
    try {
      const result = await searchPets(debouncedSearch, filters)
      if (result.success) {
        setPatients(result.data ?? [])
      } else {
        toast.error('Failed to load patients')
      }
    } catch (error) {
      toast.error('Error loading patients')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSuccess = () => {
    setShowAddDialog(false)
    loadPatients()
  }

  const statusColors = {
    active: 'bg-green-500',
    deceased: 'bg-gray-500',
    archived: 'bg-yellow-500'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Select
            value={filters.status?.[0]}
            onValueChange={(value) => 
              setFilters(prev => ({ ...prev, status: value ? [value as Pet['status']] : undefined }))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="deceased">Deceased</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.species?.[0]}
            onValueChange={(value) => 
              setFilters(prev => ({ ...prev, species: value ? [value] : undefined }))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Species</SelectItem>
              <SelectItem value="Dog">Dogs</SelectItem>
              <SelectItem value="Cat">Cats</SelectItem>
              <SelectItem value="Bird">Birds</SelectItem>
              <SelectItem value="Rabbit">Rabbits</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Breed</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Next Appointment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.species}</TableCell>
                  <TableCell>{patient.breed}</TableCell>
                  <TableCell>
                    {Math.floor(
                      (new Date().getTime() - new Date(patient.dob).getTime()) /
                        (365.25 * 24 * 60 * 60 * 1000)
                    )}{' '}
                    years
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[patient.status]}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {patient.lastVisit
                      ? format(new Date(patient.lastVisit), 'MMM d, yyyy')
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    {patient.nextAppointment
                      ? format(new Date(patient.nextAppointment), 'MMM d, yyyy')
                      : 'None scheduled'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/patients/${patient.id}`}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddPatientDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}