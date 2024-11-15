export interface Owner {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    preferredContact: 'email' | 'phone' | 'sms'
    notes?: string
    createdAt: Date
    updatedAt: Date
    petIds: string[]
  }
  
  export interface OwnerFilters {
    search?: string
    sortBy?: keyof Owner
    sortOrder?: 'asc' | 'desc'
    hasPets?: boolean
  }