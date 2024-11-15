"use client"

import * as React from "react"
import { CaretSortIcon, CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useClinicStore } from "@/hooks/use-clinic"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const newClinicSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
})

export function ClinicSwitcher() {
  const [open, setOpen] = React.useState(false)
  const [showNewClinicDialog, setShowNewClinicDialog] = React.useState(false)
  const { clinics, selectedClinic, setSelectedClinic, addClinic } = useClinicStore()

  const form = useForm<z.infer<typeof newClinicSchema>>({
    resolver: zodResolver(newClinicSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  })

  React.useEffect(() => {
    if (!selectedClinic && clinics.length > 0) {
      setSelectedClinic(clinics[0])
    }
  }, [selectedClinic, clinics, setSelectedClinic])

  function onSubmit(values: z.infer<typeof newClinicSchema>) {
    const newClinic = {
      id: values.name.toLowerCase().replace(/\s+/g, '-'),
      ...values,
    }
    addClinic(newClinic)
    setSelectedClinic(newClinic)
    setShowNewClinicDialog(false)
    toast.success("Clinic added successfully")
    form.reset()
  }

  if (!selectedClinic) return null

  return (
    <Dialog open={showNewClinicDialog} onOpenChange={setShowNewClinicDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="w-full">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a clinic"
            className="w-full justify-between"
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${selectedClinic.id}.png`}
                alt={selectedClinic.name}
              />
              <AvatarFallback>
                {selectedClinic.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {selectedClinic.name}
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search clinic..." />
              <CommandEmpty>No clinic found.</CommandEmpty>
              <CommandGroup heading="Clinics">
                {clinics.map((clinic) => (
                  <CommandItem
                    key={clinic.id}
                    onSelect={() => {
                      setSelectedClinic(clinic)
                      setOpen(false)
                    }}
                    className="text-sm"
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${clinic.id}.png`}
                        alt={clinic.name}
                      />
                      <AvatarFallback>
                        {clinic.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {clinic.name}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedClinic.id === clinic.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setShowNewClinicDialog(true)
                    setOpen(false)
                  }}
                >
                  <PlusCircledIcon className="mr-2 h-5 w-5" />
                  Add New Clinic
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Clinic</DialogTitle>
          <DialogDescription>
            Add a new clinic to your network. Fill in the clinic details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Input placeholder="Enter clinic email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewClinicDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Clinic</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}