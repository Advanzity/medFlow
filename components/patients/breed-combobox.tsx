"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useClinicStore } from "@/hooks/use-clinic"
import { searchBreeds, addNewEntry } from "@/app/actions/suggestions"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

interface BreedComboboxProps {
  species?: string
  value?: string
  onChange: (value: string) => void
  error?: boolean
}

export function BreedCombobox({ species, value, onChange, error }: BreedComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [breeds, setBreeds] = React.useState<string[]>([])
  const [search, setSearch] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [newBreed, setNewBreed] = React.useState("")
  const { selectedClinic } = useClinicStore()
  const debouncedSearch = useDebounce(search, 300)

  React.useEffect(() => {
    if (!species || !selectedClinic?.id) return

    async function fetchBreeds() {
      setIsLoading(true)
      try {
        const result = await searchBreeds({
          clinicId: selectedClinic.id,
          species,
          query: debouncedSearch || '',
          limit: 10
        })
        if (result.success) {
          setBreeds(Array.isArray(result.data) ? result.data : [])
        }
      } catch (error) {
        console.error('Error fetching breeds:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBreeds()
  }, [species, selectedClinic?.id, debouncedSearch])

  const handleAddNewBreed = async () => {
    if (!species || !selectedClinic?.id || !newBreed.trim()) return

    try {
      const result = await addNewEntry({
        clinicId: selectedClinic.id,
        type: "breed",
        value: newBreed,
        metadata: { species }
      })

      if (result.success) {
        toast.success("New breed added successfully")
        setBreeds(prev => [...prev, newBreed])
        onChange(newBreed)
        setDialogOpen(false)
        setNewBreed("")
      } else {
        toast.error(result.error as string)
      }
    } catch (error) {
      toast.error("Failed to add new breed")
    }
  }

  if (!species) {
    return (
      <Input
        disabled
        placeholder="Select a species first"
        className={cn(error && "border-destructive")}
      />
    )
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              error && "border-destructive",
              !value && "text-muted-foreground"
            )}
          >
            {value || "Select breed"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search breeds..."
              value={search || ""}
              onValueChange={setSearch}
            />
            <CommandEmpty className="py-6 text-center text-sm">
              {isLoading ? (
                "Loading..."
              ) : (
                <div className="space-y-2">
                  <p>No breeds found.</p>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Breed
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Breed</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Input
                            placeholder="Enter breed name"
                            value={newBreed}
                            onChange={(e) => setNewBreed(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddNewBreed}>
                            Add Breed
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {breeds.map((breed) => (
                <CommandItem
                  key={breed}
                  value={breed}
                  onSelect={() => {
                    onChange(breed)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === breed ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {breed}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}