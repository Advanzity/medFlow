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
import { getStaffSettings } from "@/app/actions/settings"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

const staffFormSchema = z.object({
  roles: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    permissions: z.array(z.string())
  })),
  staff: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    role: z.string(),
    specializations: z.array(z.string()),
    availability: z.array(z.object({
      day: z.number(),
      shifts: z.array(z.object({
        start: z.string(),
        end: z.string()
      }))
    }))
  }))
})

export function StaffSettings() {
  const { selectedClinic } = useClinicStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: async () => {
      if (!selectedClinic) return { roles: [], staff: [] }
      const result = await getStaffSettings(selectedClinic.id)
      if (result.success) {
        return result.data
      }
      return { roles: [], staff: [] }
    }
  })

  const { fields: roleFields, append: appendRole, remove: removeRole } = useFieldArray({
    control: form.control,
    name: "roles"
  })

  const { fields: staffFields, append: appendStaff, remove: removeStaff } = useFieldArray({
    control: form.control,
    name: "staff"
  })

  async function onSubmit(data: z.infer<typeof staffFormSchema>) {
    setIsLoading(true)
    try {
      // In a real app, this would call an API endpoint
      toast.success("Staff settings updated")
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage staff roles and their permissions
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendRole({
                id: crypto.randomUUID(),
                name: "",
                permissions: []
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {roleFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 border-b pb-4">
                <FormField
                  control={form.control}
                  name={`roles.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Role Name</FormLabel>
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
                  onClick={() => removeRole(index)}
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
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>
                Manage staff information and schedules
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendStaff({
                id: crypto.randomUUID(),
                name: "",
                role: "",
                specializations: [],
                availability: []
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {staffFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name={`staff.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`staff.${index}.role`}
                      render={({ field }) => (
                        <FormItem className="ml-4 w-[200px]">
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roleFields.map(role => (
                                <SelectItem 
                                  key={role.id} 
                                  value={role.id}
                                >
                                  {form.watch(`roles.${roleFields.indexOf(role)}.name`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStaff(index)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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