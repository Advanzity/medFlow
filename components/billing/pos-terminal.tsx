"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, WifiOff, Printer, CreditCard, Smartphone } from 'lucide-react'
import { POSDevice } from '@/lib/pos/device'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function POSTerminal() {
  const [device, setDevice] = useState<POSDevice>()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [amount, setAmount] = useState('')
  const [tip, setTip] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'chip' | 'swipe' | 'contactless'>('chip')
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [lastReceipt, setLastReceipt] = useState<string | null>(null)

  useEffect(() => {
    const pos = POSDevice.getInstance()
    setDevice(pos)

    // Set up event listeners
    const onConnected = ({ deviceId }: { deviceId: string }) => {
      toast.success(`Connected to device ${deviceId}`)
      setIsConnecting(false)
    }

    const onDisconnected = () => {
      toast.info('POS device disconnected')
      setBatteryLevel(null)
    }

    const onError = ({ error, attempts }: { error: Error; attempts: number }) => {
      toast.error(`POS error: ${error.message} (Attempt ${attempts})`)
      setIsConnecting(false)
    }

    const onStatus = ({ batteryLevel }: { batteryLevel: number }) => {
      setBatteryLevel(batteryLevel)
    }

    pos.on('connected', onConnected)
    pos.on('disconnected', onDisconnected)
    pos.on('error', onError)
    pos.on('status', onStatus)

    return () => {
      pos.off('connected', onConnected)
      pos.off('disconnected', onDisconnected)
      pos.off('error', onError)
      pos.off('status', onStatus)
    }
  }, [])

  const handleConnect = async () => {
    if (!device) return
    
    setIsConnecting(true)
    try {
      const success = await device.connect()
      if (!success) {
        toast.error('Failed to connect to POS device')
      }
    } catch (error) {
      toast.error('Error connecting to POS device')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!device) return
    
    try {
      await device.disconnect()
    } catch (error) {
      toast.error('Error disconnecting from POS device')
    }
  }

  const handleProcessPayment = async () => {
    if (!device || !device.isConnected()) {
      toast.error('POS device not connected')
      return
    }

    if (!amount || isNaN(parseFloat(amount))) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsProcessing(true)
    try {
      const result = await device.processPayment(parseFloat(amount), {
        tip: tip ? parseFloat(tip) : undefined,
        method: paymentMethod,
        reference: `PAY-${Date.now()}`
      })

      if (result.success) {
        toast.success('Payment processed successfully')
        setLastReceipt(result.receipt || null)
        setAmount('')
        setTip('')
      } else {
        toast.error(result.error || 'Payment processing failed')
      }
    } catch (error) {
      toast.error('Error processing payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrintReceipt = async () => {
    if (!device || !device.isConnected()) {
      toast.error('POS device not connected')
      return
    }

    if (!lastReceipt) {
      toast.error('No receipt to print')
      return
    }

    try {
      const success = await device.printReceipt(lastReceipt)
      if (success) {
        toast.success('Receipt printed successfully')
      } else {
        toast.error('Failed to print receipt')
      }
    } catch (error) {
      toast.error('Error printing receipt')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>POS Terminal</CardTitle>
        <div className="flex items-center gap-2">
          {batteryLevel !== null && (
            <Badge variant="outline">
              Battery: {batteryLevel}%
            </Badge>
          )}
          {device?.isConnected() ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
            >
              <WifiOff className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Connect
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={!device?.isConnected() || isProcessing}
            />
          </div>
          <div className="space-y-2">
            <Label>Tip (Optional)</Label>
            <Input
              type="number"
              step="0.01"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              placeholder="Enter tip"
              disabled={!device?.isConnected() || isProcessing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select
            value={paymentMethod}
            onValueChange={(value: 'chip' | 'swipe' | 'contactless') => 
              setPaymentMethod(value)
            }
            disabled={!device?.isConnected() || isProcessing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chip">Chip Card</SelectItem>
              <SelectItem value="swipe">Swipe Card</SelectItem>
              <SelectItem value="contactless">Contactless</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleProcessPayment}
            disabled={!device?.isConnected() || isProcessing || !amount}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 mr-2" />
                Process Payment
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePrintReceipt}
            disabled={!device?.isConnected() || !lastReceipt}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>

        {lastReceipt && (
          <div className="mt-4">
            <Label>Last Receipt</Label>
            <pre className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
              {lastReceipt}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}