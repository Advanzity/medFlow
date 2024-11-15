"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useClinicStore } from "@/hooks/use-clinic"
import { getOperationalSettings } from "@/app/actions/settings"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

const operationalFormSchema = z.object({
  scheduling: z.object({
    bufferTime: z.number().min(0),
    minAdvanceBooking: z.number().min(0),
    maxAdvanceBooking: z.number().min(1),
    allowDoubleBooking: z.boolean()
  }),
  services: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    duration: z.number().min(1),
    capacity: z.number().min(1),
    price: z.number().min(0)
  })),
  resources: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    type: z.enum(["room", "equipment"]),
    capacity: z.number().min(1)
  }))
})

export function OperationalSettings() {
  const { selectedClinic } = useClinicStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof operationalFormSchema>>({
    resolver: zodResolver(operationalFormSchema),
    defaultValues: async () => {
      if (!selectedClinic) return {}
      const result = await getOperationalSettings(selectedClinic.id)
      if (result.success) {
        return result.data
      }
      return {}
    }
  })

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services"
  })

  const { fields: resourceFields, append: appendResource, remove: removeResource } = useFieldArray({
    control: form.control,
    name: "resources"
  })

  async function onSubmit(data: z.infer<typeof operationalFormSchema>) {
    setIsLoading(true)
    try {
      // In a real app, this would call an API endpoint
      toast.success("Operational settings updated")
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
            <CardTitle>Scheduling Rules</CardTitle>
            <CardDescription>
              Configure appointment scheduling settings and rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduling.bufferTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buffer Time (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scheduling.allowDoubleBooking"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0 rounded-md border p-4">
                    <div>
                      <FormLabel>Allow Double Booking</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Enable scheduling multiple appointments at the same time
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduling.minAdvanceBooking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Advance Booking (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scheduling.maxAdvanceBooking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Advance Booking (days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
              <CardTitle>Services</CardTitle>
              <CardDescription>
                Manage available services and their settings
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendService({
                id: crypto.randomUUID(),
                name: "",
                duration: 30,
                capacity: 1,
                price: 0
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 border-b pb-4">
                <FormField
                  control={form.control}
                  name={`services.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`services.${index}.duration`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (min)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`services.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeService(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
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