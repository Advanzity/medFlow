"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useClinicStore } from "@/hooks/use-clinic"
import { getPracticeSettings, updatePracticeSettings } from "@/app/actions/settings"
import { toast } from "sonner"

const practiceFormSchema = z.object({
  name: z.string().min(1, "Clinic name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  operatingHours: z.array(z.object({
    day: z.number(),
    start: z.string(),
    end: z.string(),
    isOpen: z.boolean()
  })),
  branding: z.object({
    primaryColor: z.string(),
    theme: z.enum(["light", "dark", "system"])
  })
})

export function PracticeSettings() {
  const { selectedClinic } = useClinicStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof practiceFormSchema>>({
    resolver: zodResolver(practiceFormSchema),
    defaultValues: async () => {
      if (!selectedClinic) return {}
      const result = await getPracticeSettings(selectedClinic.id)
      if (result.success) {
        return result.data
      }
      return {}
    }
  })

  async function onSubmit(data: z.infer<typeof practiceFormSchema>) {
    if (!selectedClinic) return

    setIsLoading(true)
    try {
      const result = await updatePracticeSettings(selectedClinic.id, data)
      if (result.success) {
        toast.success("Practice settings updated")
      } else {
        toast.error(result.error as string)
      }
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Practice Information</CardTitle>
            <CardDescription>
              Manage your clinic's basic information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter clinic name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter clinic address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
            <CardDescription>
              Set your clinic's operating hours for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {days.map((day, index) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-32">{day}</div>
                  <FormField
                    control={form.control}
                    name={`operatingHours.${index}.isOpen`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <span className="text-sm text-muted-foreground">
                          {field.value ? "Open" : "Closed"}
                        </span>
                      </FormItem>
                    )}
                  />
                  {form.watch(`operatingHours.${index}.isOpen`) && (
                    <>
                      <FormField
                        control={form.control}
                        name={`operatingHours.${index}.start`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span>to</span>
                      <FormField
                        control={form.control}
                        name={`operatingHours.${index}.end`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
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