"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClinicStore } from "@/hooks/use-clinic"
import { getCommunicationSettings } from "@/app/actions/settings"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

const communicationFormSchema = z.object({
  templates: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    type: z.enum(["email", "sms", "push"]),
    subject: z.string().min(1),
    content: z.string().min(1),
    variables: z.array(z.string())
  })),
  reminders: z.array(z.object({
    id: z.string(),
    type: z.string().min(1),
    timing: z.number().min(0),
    template: z.string()
  })),
  preferences: z.object({
    defaultChannel: z.enum(["email", "sms", "push"]),
    languages: z.array(z.string())
  })
})

export function CommunicationSettings() {
  const { selectedClinic } = useClinicStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof communicationFormSchema>>({
    resolver: zodResolver(communicationFormSchema),
    defaultValues: async () => {
      if (!selectedClinic) return {}
      const result = await getCommunicationSettings(selectedClinic.id)
      if (result.success) {
        return result.data
      }
      return {}
    }
  })

  const { fields: templateFields, append: appendTemplate, remove: removeTemplate } = useFieldArray({
    name: "templates",
    control: form.control,
  })

  const { fields: reminderFields, append: appendReminder, remove: removeReminder } = useFieldArray({
    name: "reminders",
    control: form.control,
  })

  async function onSubmit(data: z.infer<typeof communicationFormSchema>) {
    setIsLoading(true)
    try {
      // In a real app, this would call an API endpoint
      toast.success("Communication settings updated")
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
            <CardTitle>Notification Templates</CardTitle>
            <CardDescription>
              Create and manage templates for different types of notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendTemplate({
                  id: crypto.randomUUID(),
                  name: "",
                  type: "email",
                  subject: "",
                  content: "",
                  variables: []
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </div>

            {templateFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name={`templates.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`templates.${index}.type`}
                      render={({ field }) => (
                        <FormItem className="ml-4 w-[200px]">
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="push">Push Notification</SelectItem>
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
                      onClick={() => removeTemplate(index)}
                      className="ml-4"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {form.watch(`templates.${index}.type`) === 'email' && (
                    <FormField
                      control={form.control}
                      name={`templates.${index}.subject`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name={`templates.${index}.content`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={4}
                            placeholder="Use {{variable}} for dynamic content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automated Reminders</CardTitle>
            <CardDescription>
              Configure automated reminders for appointments and follow-ups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendReminder({
                  id: crypto.randomUUID(),
                  type: "appointment",
                  timing: 24,
                  template: ""
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </div>

            {reminderFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 border-b pb-4">
                <FormField
                  control={form.control}
                  name={`reminders.${index}.type`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Reminder Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="appointment">Appointment</SelectItem>
                          <SelectItem value="followup">Follow-up</SelectItem>
                          <SelectItem value="prescription">Prescription</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`reminders.${index}.timing`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours Before</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`reminders.${index}.template`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Template</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templateFields.map(template => (
                            <SelectItem 
                              key={template.id} 
                              value={template.id}
                            >
                              {form.watch(`templates.${templateFields.indexOf(template)}.name`)}
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
                  onClick={() => removeReminder(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication Preferences</CardTitle>
            <CardDescription>
              Set default communication channels and language preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="preferences.defaultChannel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Communication Channel</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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