"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Owner } from '@/types/owners'
import { getOwner } from '@/app/actions/owners'
import { ArrowLeft, Mail, Phone, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface OwnerHeaderProps {
  ownerId: string
}

export function OwnerHeader({ ownerId }: OwnerHeaderProps) {
  const [owner, setOwner] = useState<Owner | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadOwner() {
      try {
        const result = await getOwner(ownerId)
        if (result.success) {
          setOwner(result.data)
        } else {
          toast.error('Failed to load owner details')
        }
      } catch (error) {
        toast.error('Error loading owner details')
      } finally {
        setIsLoading(false)
      }
    }

    loadOwner()
  }, [ownerId])

  if (isLoading || !owner) return null

  const contactIcons = {
    email: <Mail className="h-4 w-4" />,
    phone: <Phone className="h-4 w-4" />,
    sms: <MessageSquare className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/owners">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {owner.firstName} {owner.lastName}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            {contactIcons[owner.preferredContact]}
            <span>
              {owner.preferredContact === 'email' ? owner.email : owner.phone}
            </span>
          </div>
        </div>
        <Button variant="outline">Edit Details</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm font-medium text-muted-foreground mb-1">Address</div>
          <div className="space-y-1">
            <div>{owner.address.street}</div>
            <div>
              {owner.address.city}, {owner.address.state} {owner.address. zipCode}
            </div>
            <div>{owner.address.country}</div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm font-medium text-muted-foreground mb-1">Pets</div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {owner.petIds.length} pet{owner.petIds.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm font-medium text-muted-foreground mb-1">Contact Preference</div>
          <div className="flex items-center gap-2">
            {contactIcons[owner.preferredContact]}
            <span className="capitalize">{owner.preferredContact}</span>
          </div>
        </div>
      </div>
    </div>
  )
}