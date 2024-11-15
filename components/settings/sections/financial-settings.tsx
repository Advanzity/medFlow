"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClinicStore } from "@/hooks/use-clinic"
import { getFinancialSettings } from "@/app/actions/settings"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

const financialFormSchema = z.object({
  payment: z.object({
    gateway: z.string().min(1),
    currency: z.string().min(1),
    taxRate: z.number().min(0).max(100)
  }),
  billing: z.array(z.object({
    code: z.string().min(1),
    description: z.string().min(1),
    fee: z.number().min(0)
  })),
  insurance: z.array(z.object({
    provider: z.string().min(1),
    planTypes: z.array(z.string()),
    contactInfo: z.object({
      phone: z.string().min(1),
      email: z.string().email()
    })
  }))
})

export function FinancialSettings() {
  const { selectedClinic } = useClinicStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof financialFormSchema>>({
    resolver: zodResolver(financialFormSchema),
    defaultValues: async () => {
      if (!selectedClinic) return {}
      const result = await getFinancialSettings(selectedClinic.id)
      if (result.success) {
        return result.data
      }
      return {}
    }
  })

  const { fields: billingFields, append: appendBilling, remove: removeBilling } = useFieldArray({
    name: "billing",
    control: form.control
  })

  const { fields: insuranceFields, append: appendInsurance, remove: removeInsurance } = useFieldArray({
    name: "insurance",
    control: form.control
  })

  async function onSubmit(data: z.infer<typeof financialFormSchema>) {
    setIsLoading(true)
    try {
      // In a real app, this would call an API endpoint
      toast.success("Financial settings updated")
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Configuration</CardTitle>
            <CardDescription>
              Configure payment gateway and general financial settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="payment.gateway"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Gateway</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment gateway" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment.currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment.taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Billing Codes</CardTitle>
              <CardDescription>
                Manage billing codes and fee schedules
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendBilling({
                code: "",
                description: "",
                fee: 0
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Billing Code
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {billingFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 border-b pb-4">
                <FormField
                  control={form.control}
                  name={`billing.${index}.code`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`billing.${index}.description`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`billing.${index}.fee`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBilling(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Insurance Providers</CardTitle>
              <CardDescription>
                Manage insurance provider information and plans
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendInsurance({
                provider: "",
                planTypes: [],
                contactInfo: {
                  phone: "",
                  email: ""
                }
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {insuranceFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name={`insurance.${index}.provider`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Provider Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInsurance(index)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`insurance.${index}.contactInfo.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`insurance.${index}.contactInfo.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}