"use client"

// Mock POS device connection and communication
export class POSDevice {
  private static instance: POSDevice
  private connected: boolean = false
  private deviceId: string | null = null
  private connectionAttempts: number = 0
  private maxRetries: number = 3
  private listeners: Map<string, Function[]> = new Map()

  private constructor() {
    // Private constructor for singleton
    this.setupEventListeners()
  }

  static getInstance(): POSDevice {
    if (!POSDevice.instance) {
      POSDevice.instance = new POSDevice()
    }
    return POSDevice.instance
  }

  private setupEventListeners() {
    // Mock device events
    setInterval(() => {
      if (this.connected) {
        // Simulate random device status updates
        if (Math.random() > 0.95) {
          this.emit('status', { batteryLevel: Math.floor(Math.random() * 100) })
        }
      }
    }, 5000)
  }

  async connect(): Promise<boolean> {
    if (this.connected) return true
    
    try {
      // Simulate device connection
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const success = Math.random() > 0.2 // 80% success rate
      if (success) {
        this.connected = true
        this.deviceId = `POS-${Math.random().toString(36).substr(2, 9)}`
        this.connectionAttempts = 0
        this.emit('connected', { deviceId: this.deviceId })
        return true
      }
      
      throw new Error('Failed to connect to POS device')
    } catch (error) {
      this.connectionAttempts++
      this.emit('error', { error, attempts: this.connectionAttempts })
      
      if (this.connectionAttempts < this.maxRetries) {
        // Auto retry connection
        return await this.connect()
      }
      
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return
    
    // Simulate device disconnection
    await new Promise(resolve => setTimeout(resolve, 500))
    
    this.connected = false
    this.deviceId = null
    this.emit('disconnected')
  }

  async processPayment(amount: number, options?: {
    tip?: number
    reference?: string
    method?: 'chip' | 'swipe' | 'contactless'
  }): Promise<{
    success: boolean
    transactionId?: string
    error?: string
    receipt?: string
  }> {
    if (!this.connected) {
      throw new Error('POS device not connected')
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const success = Math.random() > 0.1 // 90% success rate
    if (success) {
      const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const receipt = this.generateReceipt(transactionId, amount, options)
      
      this.emit('transaction', { 
        transactionId, 
        amount, 
        status: 'completed',
        receipt 
      })
      
      return {
        success: true,
        transactionId,
        receipt
      }
    }

    const error = 'Payment processing failed'
    this.emit('transaction', { 
      status: 'failed',
      error 
    })
    
    return {
      success: false,
      error
    }
  }

  async printReceipt(receipt: string): Promise<boolean> {
    if (!this.connected) {
      throw new Error('POS device not connected')
    }

    // Simulate receipt printing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const success = Math.random() > 0.05 // 95% success rate
    if (success) {
      this.emit('print', { status: 'completed' })
      return true
    }

    this.emit('print', { 
      status: 'failed',
      error: 'Printer error' 
    })
    return false
  }

  isConnected(): boolean {
    return this.connected
  }

  getDeviceId(): string | null {
    return this.deviceId
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  private generateReceipt(transactionId: string, amount: number, options?: any): string {
    const date = new Date().toLocaleString()
    const tip = options?.tip || 0
    const total = amount + tip

    return `
MEDFLOW CLINIC
------------------------
Transaction ID: ${transactionId}
Date: ${date}
------------------------
Amount: $${amount.toFixed(2)}
Tip: $${tip.toFixed(2)}
------------------------
Total: $${total.toFixed(2)}

Method: ${options?.method || 'card'}
Reference: ${options?.reference || 'N/A'}
------------------------
Thank you for your payment
    `.trim()
  }
}

// Event types for type safety
export interface POSDeviceEvents {
  connected: { deviceId: string }
  disconnected: void
  error: { error: Error; attempts: number }
  status: { batteryLevel: number }
  transaction: {
    transactionId?: string
    amount?: number
    status: 'completed' | 'failed'
    error?: string
    receipt?: string
  }
  print: {
    status: 'completed' | 'failed'
    error?: string
  }
}