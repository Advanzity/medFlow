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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Owner, OwnerFilters } from '@/types/owners'
import { searchOwners } from '@/app/actions/owners'
import { format } from 'date-fns'
import { Search, Plus, Loader2, Mail, Phone, MessageSquare } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import { AddOwnerDialog } from './add-owner-dialog'

export function OwnerList() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<OwnerFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    loadOwners()
  }, [debouncedSearch, filters])

  const loadOwners = async () => {
    setIsLoading(true)
    try {
      const result = await searchOwners({
        ...filters,
        search: debouncedSearch
      })
      if (result.success) {
        if (result.data) {
          setOwners(result.data)
        } else {
          setOwners([])
        }
      } else {
        toast.error('Failed to load owners')
      }
    } catch (error) {
      toast.error('Error loading owners')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSuccess = () => {
    setShowAddDialog(false)
    loadOwners()
    toast.success('Owner added successfully')
  }

  const getContactIcon = (preferredContact: Owner['preferredContact']) => {
    switch (preferredContact) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'phone':
        return <Phone className="h-4 w-4" />
      case 'sms':
        return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Owner
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Pets</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : owners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No owners found
                </TableCell>
              </TableRow>
            ) : (
              owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell>
                    <div className="font-medium">
                      {owner.firstName} {owner.lastName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getContactIcon(owner.preferredContact)}
                      <span className="text-sm text-muted-foreground">
                        {owner.preferredContact === 'email' ? owner.email : owner.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {owner.address.city}, {owner.address.state}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {owner.petIds.length} pet{owner.petIds.length !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(owner.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/owners/${owner.id}`}
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

      <AddOwnerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}